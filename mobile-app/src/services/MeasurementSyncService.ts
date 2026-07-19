/**
 * Measurement Sync — MQTT → WHO Z-Score (who_standards) → Supabase
 * Offline-first: failed inserts enqueue to AsyncStorage; NetInfo drains queue.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { type NetInfoSubscription } from '@react-native-community/netinfo';
import MQTTService from './MQTTService';
import { supabase } from './SupabaseClient';
import { useChildStore, type ActiveChildMeta } from '../store/childStore';
import { useSyncStore } from '../store/syncStore';
import { invalidateMeasurementQueries } from '../hooks/useMeasurements';
import type { Gender, MeasurementRow, StuntingRisk } from '../types/database';
import type { MQTTMeasurement } from '../types';
import {
  calculateAgeInMonths,
  calculateHeightForAge,
  calculateWeightForAge,
  calculateWeightForHeight,
  determineStuntingRisk,
} from '../utils/zScoreCalculator';

const WINDOW_SIZE = 5;
const STABILITY_STD_CM = 0.35;
const RESET_JUMP_CM = 1.2;
const QUEUE_KEY = '@babygrow/measurement_offline_queue';
const MAX_QUEUE = 100;
const MAX_ATTEMPTS = 8;

export type WhoIndicator = 'wfa' | 'hfa' | 'wfh';

export interface WhoLmsParams {
  l: number;
  m: number;
  s: number;
  age_months: number;
  indicator: WhoIndicator;
  gender: Gender;
}

export interface MeasurementZScores {
  z_score_hfa: number | null;
  z_score_wfa: number | null;
  z_score_wfh: number | null;
  stunting_risk: StuntingRisk | null;
  age_months: number;
  source: 'db' | 'local_fallback';
}

export interface SyncMeasurementPayload {
  child_id: string;
  height_cm: number;
  weight_kg?: number | null;
  head_circumference_cm?: number | null;
  source: MeasurementRow['source'];
  device_id?: string | null;
  measured_at?: string;
  gender: Gender;
  date_of_birth: string;
}

interface QueuedMeasurement extends SyncMeasurementPayload {
  local_id: string;
  height_cm: number;
  weight_kg: number | null;
  z_score_hfa: number | null;
  z_score_wfa: number | null;
  z_score_wfh: number | null;
  stunting_risk: StuntingRisk | null;
  measured_at: string;
  attempts: number;
  enqueued_at: string;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return Number.POSITIVE_INFINITY;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** WHO LMS: Z = ((value/M)^L - 1) / (L*S); L≈0 → ln form */
export function lmsZScore(value: number, l: number, m: number, s: number): number {
  if (!value || !m || !s) return 0;
  let z: number;
  if (Math.abs(l) < 1e-8) {
    z = Math.log(value / m) / s;
  } else {
    z = (Math.pow(value / m, l) - 1) / (l * s);
  }
  return Math.round(z * 100) / 100;
}

function mapStuntingRisk(
  level: ReturnType<typeof determineStuntingRisk>['level']
): StuntingRisk {
  if (level === 'severely_stunted') return 'severe';
  return level;
}

class MeasurementSyncService {
  private static instance: MeasurementSyncService;
  private buffer: MQTTMeasurement[] = [];
  private lastPersistedKey: string | null = null;
  private unsubscribeMqtt: (() => void) | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private netInfoUnsub: NetInfoSubscription | null = null;
  private persisting = false;
  private processingQueue = false;
  private activeChild: ActiveChildMeta | null = null;
  /** In-memory LMS cache: `${indicator}:${gender}:${age}` */
  private lmsCache = new Map<string, WhoLmsParams>();

  static getInstance(): MeasurementSyncService {
    if (!MeasurementSyncService.instance) {
      MeasurementSyncService.instance = new MeasurementSyncService();
    }
    return MeasurementSyncService.instance;
  }

  /** @deprecated Prefer childStore.setActiveChild */
  setActiveChild(childId: string | null): void {
    if (!childId) {
      useChildStore.getState().clearActiveChild();
      this.activeChild = null;
    } else {
      useChildStore.getState().setActiveChildId(childId);
      this.activeChild = useChildStore.getState().activeChild;
    }
    this.buffer = [];
    this.lastPersistedKey = null;
  }

  start(): void {
    if (this.unsubscribeMqtt) return;

    this.activeChild = useChildStore.getState().activeChild;
    this.unsubscribeStore = useChildStore.subscribe((state) => {
      const next = state.activeChild;
      if (next?.id !== this.activeChild?.id) {
        this.buffer = [];
        this.lastPersistedKey = null;
      }
      this.activeChild = next;
    });

    const mqtt = MQTTService.getInstance();
    this.unsubscribeMqtt = mqtt.subscribeMeasurements((data) => {
      void this.onMeasurement(data);
    });

    this.netInfoUnsub = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true;
      const isInternetReachable = state.isInternetReachable ?? null;
      useSyncStore.getState().publish({ isConnected, isInternetReachable });
      const online = isConnected && isInternetReachable !== false;
      if (online) {
        void this.processQueue();
      }
    });

    // Hydrate queue length + drain leftover from previous session
    void this.refreshSyncStore();
    void this.processQueue();
  }

  stop(): void {
    this.unsubscribeMqtt?.();
    this.unsubscribeMqtt = null;
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    this.netInfoUnsub?.();
    this.netInfoUnsub = null;
    this.buffer = [];
  }

  /**
   * Fetch L, M, S from public.who_standards for age_months + gender.
   */
  async calculateZScoreFromDB(params: {
    indicator: WhoIndicator;
    gender: Gender;
    age_months: number;
  }): Promise<WhoLmsParams | null> {
    const age = Math.max(0, Math.min(60, Math.round(params.age_months)));
    const cacheKey = `${params.indicator}:${params.gender}:${age}`;
    const cached = this.lmsCache.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('who_standards')
      .select('l, m, s, age_months, indicator, gender')
      .eq('indicator', params.indicator)
      .eq('gender', params.gender)
      .eq('age_months', age)
      .maybeSingle();

    if (error) {
      console.warn('[MeasurementSync] who_standards lookup failed', error.message);
      return null;
    }
    if (!data) return null;

    const row: WhoLmsParams = {
      l: Number(data.l),
      m: Number(data.m),
      s: Number(data.s),
      age_months: Number(data.age_months),
      indicator: data.indicator as WhoIndicator,
      gender: data.gender as Gender,
    };
    this.lmsCache.set(cacheKey, row);
    return row;
  }

  /**
   * Compute HFA / WFA (and WFH via local tables if weight present) using DB LMS first.
   */
  async computeZScoresFromWhoStandards(input: {
    height_cm: number;
    weight_kg?: number | null;
    gender: Gender;
    date_of_birth: string;
  }): Promise<MeasurementZScores> {
    const age_months = calculateAgeInMonths(input.date_of_birth);
    const weight =
      input.weight_kg && input.weight_kg > 0 ? input.weight_kg : null;

    try {
      const hfaLms = await this.calculateZScoreFromDB({
        indicator: 'hfa',
        gender: input.gender,
        age_months,
      });

      if (!hfaLms) {
        return this.fallbackLocalZScores(input, age_months);
      }

      const z_score_hfa = lmsZScore(
        input.height_cm,
        hfaLms.l,
        hfaLms.m,
        hfaLms.s
      );

      let z_score_wfa: number | null = null;
      let z_score_wfh: number | null = null;

      if (weight) {
        const wfaLms = await this.calculateZScoreFromDB({
          indicator: 'wfa',
          gender: input.gender,
          age_months,
        });
        if (wfaLms) {
          z_score_wfa = lmsZScore(weight, wfaLms.l, wfaLms.m, wfaLms.s);
        }

        // WFH not seeded (0–24 age-based only) — keep local calculator
        z_score_wfh = calculateWeightForHeight(
          weight,
          input.height_cm,
          input.gender
        ).zscore;
      }

      return {
        z_score_hfa,
        z_score_wfa,
        z_score_wfh,
        stunting_risk: mapStuntingRisk(
          determineStuntingRisk(z_score_hfa).level
        ),
        age_months,
        source: 'db',
      };
    } catch (err) {
      console.warn('[MeasurementSync] DB Z-score failed, local fallback', err);
      return this.fallbackLocalZScores(input, age_months);
    }
  }

  private fallbackLocalZScores(
    input: {
      height_cm: number;
      weight_kg?: number | null;
      gender: Gender;
      date_of_birth: string;
    },
    age_months: number
  ): MeasurementZScores {
    const hfa = calculateHeightForAge(
      input.height_cm,
      age_months,
      input.gender
    );
    const weight =
      input.weight_kg && input.weight_kg > 0 ? input.weight_kg : null;
    let z_score_wfa: number | null = null;
    let z_score_wfh: number | null = null;
    if (weight) {
      z_score_wfa = calculateWeightForAge(weight, age_months, input.gender)
        .zscore;
      z_score_wfh = calculateWeightForHeight(
        weight,
        input.height_cm,
        input.gender
      ).zscore;
    }
    return {
      z_score_hfa: hfa.zscore,
      z_score_wfa,
      z_score_wfh,
      stunting_risk: mapStuntingRisk(determineStuntingRisk(hfa.zscore).level),
      age_months,
      source: 'local_fallback',
    };
  }

  /**
   * Primary path: Z-score → insert; on failure enqueue for offline retry.
   */
  async syncToSupabase(input: SyncMeasurementPayload): Promise<MeasurementRow | null> {
    if (!input.child_id) throw new Error('child_id wajib');
    if (!input.height_cm || input.height_cm <= 0) {
      throw new Error('Tinggi badan tidak valid');
    }

    const scores = await this.computeZScoresFromWhoStandards({
      height_cm: input.height_cm,
      weight_kg: input.weight_kg,
      gender: input.gender,
      date_of_birth: input.date_of_birth,
    });

    const payload: QueuedMeasurement = {
      local_id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      child_id: input.child_id,
      height_cm: input.height_cm,
      weight_kg:
        input.weight_kg && input.weight_kg > 0 ? input.weight_kg : null,
      head_circumference_cm: input.head_circumference_cm ?? null,
      z_score_hfa: scores.z_score_hfa,
      z_score_wfa: scores.z_score_wfa,
      z_score_wfh: scores.z_score_wfh,
      stunting_risk: scores.stunting_risk,
      source: input.source,
      device_id: input.device_id ?? null,
      measured_at: input.measured_at ?? new Date().toISOString(),
      gender: input.gender,
      date_of_birth: input.date_of_birth,
      attempts: 0,
      enqueued_at: new Date().toISOString(),
    };

    return this.insertWithRetry(payload);
  }

  /**
   * Attempt Supabase insert; enqueue on network/DB failure.
   */
  async insertWithRetry(
    item: QueuedMeasurement
  ): Promise<MeasurementRow | null> {
    try {
      const net = await NetInfo.fetch();
      const online =
        net.isConnected === true && net.isInternetReachable !== false;

      if (!online) {
        await this.enqueue(item);
        console.log('[MeasurementSync] offline — queued', item.local_id);
        return null;
      }

      const row = await this.insertMeasurement(item);
      console.log(
        '[MeasurementSync] saved',
        row.height_cm,
        'cm | HFA z=',
        row.z_score_hfa,
        '| risk=',
        row.stunting_risk
      );
      return row;
    } catch (error) {
      console.error('[MeasurementSync] insert failed — queueing', error);
      await this.enqueue({
        ...item,
        attempts: (item.attempts ?? 0) + 1,
      });
      return null;
    }
  }

  private async insertMeasurement(
    item: QueuedMeasurement
  ): Promise<MeasurementRow> {
    // Refresh Z-scores from DB when retrying (may have been computed offline)
    let z_score_hfa = item.z_score_hfa;
    let z_score_wfa = item.z_score_wfa;
    let z_score_wfh = item.z_score_wfh;
    let stunting_risk = item.stunting_risk;

    if (item.date_of_birth && item.gender) {
      try {
        const scores = await this.computeZScoresFromWhoStandards({
          height_cm: item.height_cm,
          weight_kg: item.weight_kg,
          gender: item.gender,
          date_of_birth: item.date_of_birth,
        });
        z_score_hfa = scores.z_score_hfa;
        z_score_wfa = scores.z_score_wfa;
        z_score_wfh = scores.z_score_wfh;
        stunting_risk = scores.stunting_risk;
      } catch {
        // keep existing scores
      }
    }

    const { data, error } = await supabase
      .from('measurements')
      .insert({
        child_id: item.child_id,
        height_cm: item.height_cm,
        weight_kg: item.weight_kg,
        head_circumference_cm: item.head_circumference_cm ?? null,
        z_score_hfa,
        z_score_wfa,
        z_score_wfh,
        stunting_risk,
        source: item.source,
        device_id: item.device_id ?? null,
        measured_at: item.measured_at,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Gagal menyimpan pengukuran');
    const row = data as MeasurementRow;
    invalidateMeasurementQueries(row.child_id);
    return row;
  }

  /**
   * Replay AsyncStorage queue when connectivity returns.
   */
  async processQueue(): Promise<{ sent: number; remaining: number }> {
    if (this.processingQueue) {
      return { sent: 0, remaining: -1 };
    }

    this.processingQueue = true;
    useSyncStore.getState().setProcessing(true);
    let sent = 0;

    try {
      const net = await NetInfo.fetch();
      const isConnected = net.isConnected === true;
      const isInternetReachable = net.isInternetReachable ?? null;
      useSyncStore.getState().publish({ isConnected, isInternetReachable });

      const online = isConnected && isInternetReachable !== false;
      if (!online) {
        const q = await this.readQueue();
        useSyncStore.getState().setQueueLength(q.length);
        return { sent: 0, remaining: q.length };
      }

      const queue = await this.readQueue();
      if (queue.length === 0) {
        useSyncStore.getState().setQueueLength(0);
        return { sent: 0, remaining: 0 };
      }

      const remaining: QueuedMeasurement[] = [];

      for (const item of queue) {
        if ((item.attempts ?? 0) >= MAX_ATTEMPTS) {
          console.warn(
            '[MeasurementSync] dropping after max attempts',
            item.local_id
          );
          continue;
        }
        try {
          await this.insertMeasurement(item);
          sent += 1;
        } catch (err) {
          console.warn('[MeasurementSync] queue item failed', item.local_id, err);
          remaining.push({
            ...item,
            attempts: (item.attempts ?? 0) + 1,
          });
        }
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      useSyncStore.getState().setQueueLength(remaining.length);
      console.log(
        `[MeasurementSync] processQueue sent=${sent} remaining=${remaining.length}`
      );
      return { sent, remaining: remaining.length };
    } finally {
      this.processingQueue = false;
      useSyncStore.getState().setProcessing(false);
      await this.refreshSyncStore();
    }
  }

  async getQueueLength(): Promise<number> {
    return (await this.readQueue()).length;
  }

  /** Push current AsyncStorage queue + NetInfo into Zustand for UI */
  async refreshSyncStore(): Promise<void> {
    const queue = await this.readQueue();
    const net = await NetInfo.fetch();
    useSyncStore.getState().publish({
      queueLength: queue.length,
      isConnected: net.isConnected === true,
      isInternetReachable: net.isInternetReachable ?? null,
      isProcessing: this.processingQueue,
    });
  }

  private async readQueue(): Promise<QueuedMeasurement[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as QueuedMeasurement[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async enqueue(item: QueuedMeasurement): Promise<void> {
    const queue = await this.readQueue();
    // Dedup by measured_at + child + height
    const dup = queue.some(
      (q) =>
        q.child_id === item.child_id &&
        q.measured_at === item.measured_at &&
        Math.abs(q.height_cm - item.height_cm) < 0.05
    );
    if (dup) return;

    queue.push(item);
    while (queue.length > MAX_QUEUE) queue.shift();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    useSyncStore.getState().setQueueLength(queue.length);
  }

  private async onMeasurement(data: MQTTMeasurement): Promise<void> {
    const child = this.activeChild ?? useChildStore.getState().activeChild;
    if (!child?.id) return;
    if (!data.height_cm || data.height_cm <= 0) return;

    const last = this.buffer[this.buffer.length - 1];
    if (last && Math.abs(last.height_cm - data.height_cm) > RESET_JUMP_CM) {
      this.buffer = [];
      this.lastPersistedKey = null;
    }

    this.buffer.push(data);
    if (this.buffer.length > WINDOW_SIZE) {
      this.buffer.shift();
    }

    if (this.buffer.length < WINDOW_SIZE) return;

    const heights = this.buffer.map((m) => m.height_cm);
    if (stdDev(heights) > STABILITY_STD_CM) return;

    const stable = this.buffer[this.buffer.length - 1];
    const key = `${stable.height_cm.toFixed(1)}_${(stable.weight_kg || 0).toFixed(1)}`;
    if (key === this.lastPersistedKey || this.persisting) return;

    this.persisting = true;
    try {
      await this.syncToSupabase({
        child_id: child.id,
        height_cm: stable.height_cm,
        weight_kg: stable.weight_kg || null,
        source: 'mqtt',
        device_id: stable.deviceId,
        measured_at: stable.timestamp,
        gender: child.gender,
        date_of_birth: child.date_of_birth,
      });
      this.lastPersistedKey = key;
    } catch (error) {
      console.error('[MeasurementSync] syncToSupabase error', error);
    } finally {
      this.persisting = false;
    }
  }
}

export default MeasurementSyncService;
