/**
 * Measurement Sync — MQTT stream → Supabase `measurements`
 * Inserts only when sensor readings stabilize.
 */

import MQTTService from './MQTTService';
import { supabase } from './SupabaseClient';
import type { MQTTMeasurement } from '../types';

const WINDOW_SIZE = 5;
const STABILITY_STD_CM = 0.35;
const RESET_JUMP_CM = 1.2;

function stdDev(values: number[]): number {
  if (values.length < 2) return Number.POSITIVE_INFINITY;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

class MeasurementSyncService {
  private static instance: MeasurementSyncService;
  private activeChildId: string | null = null;
  private buffer: MQTTMeasurement[] = [];
  private lastPersistedKey: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private persisting = false;

  static getInstance(): MeasurementSyncService {
    if (!MeasurementSyncService.instance) {
      MeasurementSyncService.instance = new MeasurementSyncService();
    }
    return MeasurementSyncService.instance;
  }

  setActiveChild(childId: string | null): void {
    this.activeChildId = childId;
    this.buffer = [];
    this.lastPersistedKey = null;
  }

  start(): void {
    if (this.unsubscribe) return;

    const mqtt = MQTTService.getInstance();
    this.unsubscribe = mqtt.subscribeMeasurements((data) => {
      void this.onMeasurement(data);
    });
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.buffer = [];
  }

  private async onMeasurement(data: MQTTMeasurement): Promise<void> {
    if (!this.activeChildId) return;
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
    const key = `${stable.height_cm.toFixed(1)}_${stable.weight_kg.toFixed(1)}`;
    if (key === this.lastPersistedKey || this.persisting) return;

    await this.persist(stable);
    this.lastPersistedKey = key;
  }

  private async persist(data: MQTTMeasurement): Promise<void> {
    if (!this.activeChildId) return;

    this.persisting = true;
    try {
      const { error } = await supabase.from('measurements').insert({
        child_id: this.activeChildId,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg || null,
        source: 'mqtt',
        device_id: data.deviceId,
        measured_at: data.timestamp,
        stunting_risk: null,
      });

      if (error) {
        console.error('[MeasurementSync] insert failed:', error.message);
      } else {
        console.log('[MeasurementSync] persisted stable reading', data.height_cm);
      }
    } catch (error) {
      console.error('[MeasurementSync] unexpected error', error);
    } finally {
      this.persisting = false;
    }
  }
}

export default MeasurementSyncService;
