/**
 * Medical-grade WHO LMS Z-score engine (BabyGrow)
 *
 * Formula (WHO Box-Cox Power Exponential):
 *   L ≠ 0 → Z = (((X / M) ^ L) - 1) / (L * S)
 *   L = 0 → Z = ln(X / M) / S
 *
 * Data flow: Supabase who_standards → circuit breaker → local LMS tables
 */

import { supabase } from '../services/SupabaseClient';
import {
  lookupLocalWhoLms,
  type WhoGender,
  type WhoIndicatorCode,
  type WhoLmsPoint,
} from '../constants/whoLocalFallback';
import type { ZScore as LegacyZScore } from '../types/models';

// ─── Public types ────────────────────────────────────────────────────────────

export type WhoIndicator = 'WFA' | 'HFA' | 'WFH' | 'wfa' | 'hfa' | 'wfh';

export interface Child {
  id?: string;
  gender: WhoGender | 'Laki-laki' | 'Perempuan';
  date_of_birth: string;
  /** Optional precomputed age; otherwise derived from date_of_birth */
  age_months?: number;
}

export interface Measurement {
  height_cm?: number | null;
  weight_kg?: number | null;
  measured_at?: string;
}

export interface WHOStandardData {
  indicator: WhoIndicatorCode;
  gender: WhoGender;
  /** Age months (wfa/hfa) OR length_cm stored in age_months column (wfh) */
  age_months: number;
  length_cm?: number | null;
  L: number;
  M: number;
  S: number;
}

export type KemenkesStatus =
  // TB/U
  | 'Sangat Pendek (Severely Stunted)'
  | 'Pendek (Stunted)'
  | 'Normal'
  | 'Tinggi'
  // BB/U
  | 'Berat Badan Sangat Kurang (Severely Underweight)'
  | 'Berat Badan Kurang (Underweight)'
  | 'Berat Badan Normal'
  | 'Risiko Berat Badan Lebih'
  // BB/TB
  | 'Gizi Buruk (Severe Wasting)'
  | 'Gizi Kurang (Wasting)'
  | 'Gizi Baik (Normal)'
  | 'Berisiko Gizi Lebih'
  | 'Gizi Lebih (Overweight)'
  | 'Obesitas (Obese)';

export interface ZScoreResult {
  indicator: WhoIndicatorCode;
  zScore: number;
  status: KemenkesStatus;
  percentile: number;
  value: number;
  ageMonths: number;
  lms: WHOStandardData;
  source: 'supabase' | 'local_fallback';
}

export class ZScoreError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ZScoreError';
    this.code = code;
  }
}

const SUPABASE_TIMEOUT_MS = 3500;

// ─── Pure LMS math ───────────────────────────────────────────────────────────

/**
 * Official WHO LMS Z-score.
 * If L == 0 (within epsilon): Z = ln(X/M) / S
 * Else: Z = (((X/M)^L) - 1) / (L * S)
 */
export function lmsZScore(x: number, L: number, M: number, S: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(L) || !Number.isFinite(M) || !Number.isFinite(S)) {
    throw new ZScoreError('INVALID_LMS', 'Parameter LMS atau nilai pengukuran tidak valid');
  }
  if (x <= 0) {
    throw new ZScoreError('INVALID_VALUE', 'Nilai pengukuran harus > 0');
  }
  if (M <= 0 || S <= 0) {
    throw new ZScoreError('INVALID_LMS', 'Parameter M dan S harus > 0');
  }

  let z: number;
  if (Math.abs(L) < 1e-8) {
    z = Math.log(x / M) / S;
  } else {
    z = (Math.pow(x / M, L) - 1) / (L * S);
  }

  if (!Number.isFinite(z)) {
    throw new ZScoreError('CALC_FAILED', 'Perhitungan Z-score menghasilkan nilai tidak valid');
  }

  return Math.round(z * 100) / 100;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function normalizeIndicator(indicator: WhoIndicator): WhoIndicatorCode {
  const t = indicator.toLowerCase() as WhoIndicatorCode;
  if (t !== 'wfa' && t !== 'hfa' && t !== 'wfh') {
    throw new ZScoreError('INVALID_INDICATOR', `Indikator tidak didukung: ${indicator}`);
  }
  return t;
}

export function normalizeGender(
  gender: Child['gender']
): WhoGender {
  if (gender === 'female' || gender === 'Perempuan') return 'female';
  if (gender === 'male' || gender === 'Laki-laki') return 'male';
  throw new ZScoreError('INVALID_GENDER', `Jenis kelamin tidak valid: ${String(gender)}`);
}

/**
 * Age in completed months from date of birth (calendar).
 * For decimal ages passed explicitly, use `roundAgeMonthsWho`.
 */
export function calculateAgeInMonths(
  dateOfBirth: string,
  atDate?: string | Date
): number {
  const dob = new Date(dateOfBirth);
  const at = atDate ? new Date(atDate) : new Date();

  if (Number.isNaN(dob.getTime()) || Number.isNaN(at.getTime())) {
    throw new ZScoreError('INVALID_DOB', 'Tanggal lahir atau tanggal ukur tidak valid');
  }
  if (at < dob) {
    throw new ZScoreError('INVALID_DOB', 'Tanggal ukur tidak boleh sebelum tanggal lahir');
  }

  let months =
    (at.getFullYear() - dob.getFullYear()) * 12 + (at.getMonth() - dob.getMonth());
  if (at.getDate() < dob.getDate()) months -= 1;

  return Math.max(0, months);
}

/** WHO: round age in months to nearest integer month (e.g. 18.5 → 19) */
export function roundAgeMonthsWho(ageMonths: number): number {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) {
    throw new ZScoreError('INVALID_AGE', 'Usia bulan tidak valid');
  }
  return Math.max(0, Math.min(60, Math.round(ageMonths)));
}

function zScoreToPercentile(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const cdf = z > 0 ? 1 - p : p;
  return Math.round(cdf * 1000) / 10;
}

function resolveMeasurementValue(
  indicator: WhoIndicatorCode,
  measurement: Measurement
): number {
  if (indicator === 'hfa') {
    const h = measurement.height_cm;
    if (h == null || !Number.isFinite(h) || h <= 0) {
      throw new ZScoreError(
        'MISSING_HEIGHT',
        'Tinggi badan wajib diisi untuk indikator TB/U (HFA)'
      );
    }
    if (h < 30 || h > 150) {
      throw new ZScoreError(
        'INVALID_HEIGHT',
        `Tinggi badan tidak logis: ${h} cm (rentang wajar 30–150 cm)`
      );
    }
    return h;
  }

  const w = measurement.weight_kg;
  if (w == null || !Number.isFinite(w) || w <= 0) {
    throw new ZScoreError(
      'MISSING_WEIGHT',
      indicator === 'wfa'
        ? 'Berat badan wajib diisi untuk indikator BB/U (WFA)'
        : 'Berat badan wajib diisi untuk indikator BB/TB (WFH)'
    );
  }
  if (w < 0.5 || w > 40) {
    throw new ZScoreError(
      'INVALID_WEIGHT',
      `Berat badan tidak logis: ${w} kg (rentang wajar 0.5–40 kg)`
    );
  }

  if (indicator === 'wfh') {
    const h = measurement.height_cm;
    if (h == null || !Number.isFinite(h) || h <= 0) {
      throw new ZScoreError(
        'MISSING_HEIGHT',
        'Tinggi badan wajib diisi untuk indikator BB/TB (WFH)'
      );
    }
    if (h < 45 || h > 120) {
      throw new ZScoreError(
        'INVALID_HEIGHT',
        `Tinggi untuk BB/TB di luar rentang WHO (45–120 cm): ${h} cm`
      );
    }
  }

  return w;
}

function lookupKeyForIndicator(
  indicator: WhoIndicatorCode,
  ageMonths: number,
  measurement: Measurement
): number {
  if (indicator === 'wfh') {
    return Math.round(Number(measurement.height_cm));
  }
  return ageMonths;
}

// ─── Kemenkes categorization ─────────────────────────────────────────────────

/**
 * Official Kemenkes anthropometry status from Z-score + indicator.
 */
export function categorizeZScore(
  zScore: number,
  indicator: WhoIndicator
): KemenkesStatus {
  if (!Number.isFinite(zScore)) {
    throw new ZScoreError('INVALID_Z', 'Z-score tidak valid untuk kategorisasi');
  }

  const ind = normalizeIndicator(indicator);

  if (ind === 'hfa') {
    if (zScore < -3) return 'Sangat Pendek (Severely Stunted)';
    if (zScore < -2) return 'Pendek (Stunted)';
    if (zScore <= 3) return 'Normal';
    return 'Tinggi';
  }

  if (ind === 'wfa') {
    if (zScore < -3) return 'Berat Badan Sangat Kurang (Severely Underweight)';
    if (zScore < -2) return 'Berat Badan Kurang (Underweight)';
    if (zScore <= 1) return 'Berat Badan Normal';
    return 'Risiko Berat Badan Lebih';
  }

  // wfh — BB/TB
  if (zScore < -3) return 'Gizi Buruk (Severe Wasting)';
  if (zScore < -2) return 'Gizi Kurang (Wasting)';
  if (zScore <= 1) return 'Gizi Baik (Normal)';
  if (zScore <= 2) return 'Berisiko Gizi Lebih';
  if (zScore <= 3) return 'Gizi Lebih (Overweight)';
  return 'Obesitas (Obese)';
}

/** Map HFA Z to DB `stunting_risk` enum used by measurements table */
export function determineStuntingRisk(heightForAgeZScore: number): {
  level: 'normal' | 'at_risk' | 'stunted' | 'severely_stunted';
  description: string;
} {
  if (heightForAgeZScore < -3) {
    return {
      level: 'severely_stunted',
      description: categorizeZScore(heightForAgeZScore, 'hfa'),
    };
  }
  if (heightForAgeZScore < -2) {
    return {
      level: 'stunted',
      description: categorizeZScore(heightForAgeZScore, 'hfa'),
    };
  }
  // Soft monitoring band (clinical caution; Kemenkes labels as Normal)
  if (heightForAgeZScore < -1) {
    return {
      level: 'at_risk',
      description: 'Normal (berisiko — monitoring ketat)',
    };
  }
  return {
    level: 'normal',
    description: categorizeZScore(heightForAgeZScore, 'hfa'),
  };
}

// ─── Data sources ────────────────────────────────────────────────────────────

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new ZScoreError('TIMEOUT', `who_standards timeout ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchWhoFromSupabase(
  indicator: WhoIndicatorCode,
  gender: WhoGender,
  lookupKey: number
): Promise<WHOStandardData | null> {
  const key =
    indicator === 'wfh'
      ? Math.max(45, Math.min(110, Math.round(lookupKey)))
      : Math.max(0, Math.min(60, Math.round(lookupKey)));

  const result = await withTimeout(
    (async () =>
      supabase
        .from('who_standards')
        .select('indicator, gender, age_months, l, m, s')
        .eq('indicator', indicator)
        .eq('gender', gender)
        .eq('age_months', key)
        .maybeSingle())(),
    SUPABASE_TIMEOUT_MS
  );

  const { data, error } = result;

  if (error) {
    throw new ZScoreError('SUPABASE_ERROR', error.message);
  }
  if (!data) return null;

  const row = data as {
    indicator: string;
    gender: string;
    age_months: number;
    l: number;
    m: number;
    s: number;
  };

  return {
    indicator,
    gender,
    age_months: Number(row.age_months),
    length_cm: indicator === 'wfh' ? Number(row.age_months) : null,
    L: Number(row.l),
    M: Number(row.m),
    S: Number(row.s),
  };
}

function fetchWhoFromLocal(
  indicator: WhoIndicatorCode,
  gender: WhoGender,
  lookupKey: number
): WHOStandardData {
  const point: WhoLmsPoint | null = lookupLocalWhoLms(indicator, gender, lookupKey);
  if (!point) {
    throw new ZScoreError(
      'LOCAL_MISS',
      `Data LMS lokal tidak ditemukan (${indicator}/${gender}/${lookupKey})`
    );
  }
  const key =
    indicator === 'wfh'
      ? Math.max(45, Math.min(110, Math.round(lookupKey)))
      : Math.max(0, Math.min(60, Math.round(lookupKey)));

  return {
    indicator,
    gender,
    age_months: key,
    length_cm: indicator === 'wfh' ? key : null,
    L: point.L,
    M: point.M,
    S: point.S,
  };
}

async function resolveWhoStandard(
  indicator: WhoIndicatorCode,
  gender: WhoGender,
  lookupKey: number
): Promise<{ data: WHOStandardData; source: ZScoreResult['source'] }> {
  try {
    const remote = await fetchWhoFromSupabase(indicator, gender, lookupKey);
    if (remote) {
      return { data: remote, source: 'supabase' };
    }
  } catch (err) {
    if (__DEV__) {
      console.warn(
        '[ZScore] Supabase who_standards miss/fail → local fallback',
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    data: fetchWhoFromLocal(indicator, gender, lookupKey),
    source: 'local_fallback',
  };
}

// ─── Main API ────────────────────────────────────────────────────────────────

/**
 * Primary engine: Supabase-first LMS Z-score for one indicator.
 */
export async function calculateZScore(
  childData: Child,
  measurementData: Measurement,
  indicator: WhoIndicator
): Promise<ZScoreResult> {
  const ind = normalizeIndicator(indicator);
  const gender = normalizeGender(childData.gender);

  const ageMonths =
    childData.age_months != null
      ? roundAgeMonthsWho(childData.age_months)
      : roundAgeMonthsWho(
          calculateAgeInMonths(childData.date_of_birth, measurementData.measured_at)
        );

  const value = resolveMeasurementValue(ind, measurementData);
  const key = lookupKeyForIndicator(ind, ageMonths, measurementData);
  const { data: lms, source } = await resolveWhoStandard(ind, gender, key);
  const zScore = lmsZScore(value, lms.L, lms.M, lms.S);

  return {
    indicator: ind,
    zScore,
    status: categorizeZScore(zScore, ind),
    percentile: zScoreToPercentile(zScore),
    value,
    ageMonths,
    lms,
    source,
  };
}

/**
 * Compute HFA (+ optional WFA/WFH) in one call — used by sync / persistence.
 */
export async function computeAllZScores(
  childData: Child,
  measurementData: Measurement
): Promise<{
  z_score_hfa: number;
  z_score_wfa: number | null;
  z_score_wfh: number | null;
  stunting_risk: ReturnType<typeof determineStuntingRisk>['level'];
  status_hfa: KemenkesStatus;
  status_wfa: KemenkesStatus | null;
  status_wfh: KemenkesStatus | null;
  age_months: number;
  source: ZScoreResult['source'];
}> {
  const hfa = await calculateZScore(childData, measurementData, 'hfa');
  let z_score_wfa: number | null = null;
  let z_score_wfh: number | null = null;
  let status_wfa: KemenkesStatus | null = null;
  let status_wfh: KemenkesStatus | null = null;
  let source: ZScoreResult['source'] = hfa.source;

  const weight =
    measurementData.weight_kg != null && measurementData.weight_kg > 0
      ? measurementData.weight_kg
      : null;

  if (weight) {
    try {
      const wfa = await calculateZScore(childData, measurementData, 'wfa');
      z_score_wfa = wfa.zScore;
      status_wfa = wfa.status;
      if (wfa.source === 'local_fallback') source = 'local_fallback';
    } catch (err) {
      if (__DEV__) console.warn('[ZScore] WFA skipped', err);
    }

    try {
      const wfh = await calculateZScore(childData, measurementData, 'wfh');
      z_score_wfh = wfh.zScore;
      status_wfh = wfh.status;
      if (wfh.source === 'local_fallback') source = 'local_fallback';
    } catch (err) {
      if (__DEV__) console.warn('[ZScore] WFH skipped', err);
    }
  }

  const risk = determineStuntingRisk(hfa.zScore);

  return {
    z_score_hfa: hfa.zScore,
    z_score_wfa,
    z_score_wfh,
    stunting_risk: risk.level,
    status_hfa: hfa.status,
    status_wfa,
    status_wfh,
    age_months: hfa.ageMonths,
    source,
  };
}

// ─── Sync local helpers (backward compatible for UI / offline paths) ─────────

function toLegacyCategory(z: number): LegacyZScore['category'] {
  if (z < -3) return 'severely_low';
  if (z < -2) return 'low';
  if (z > 3) return 'severely_high';
  if (z > 2) return 'high';
  return 'normal';
}

function localLegacyResult(
  indicator: WhoIndicatorCode,
  gender: WhoGender,
  lookupKey: number,
  value: number
): LegacyZScore {
  const point = lookupLocalWhoLms(indicator, gender, lookupKey);
  if (!point) {
    throw new ZScoreError('LOCAL_MISS', 'Data LMS lokal tidak ditemukan');
  }
  const zscore = lmsZScore(value, point.L, point.M, point.S);
  return {
    value,
    zscore,
    percentile: zScoreToPercentile(zscore),
    category: toLegacyCategory(zscore),
  };
}

/** Sync WFA using local LMS (offline / sync wrappers) */
export function calculateWeightForAge(
  weightKg: number,
  ageMonths: number,
  gender: WhoGender
): LegacyZScore {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new ZScoreError('INVALID_WEIGHT', 'Berat badan tidak valid');
  }
  return localLegacyResult('wfa', gender, roundAgeMonthsWho(ageMonths), weightKg);
}

/** Sync HFA using local LMS */
export function calculateHeightForAge(
  heightCm: number,
  ageMonths: number,
  gender: WhoGender
): LegacyZScore {
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    throw new ZScoreError('INVALID_HEIGHT', 'Tinggi badan tidak valid');
  }
  return localLegacyResult('hfa', gender, roundAgeMonthsWho(ageMonths), heightCm);
}

/** Sync WFH using local LMS (keyed by height cm) */
export function calculateWeightForHeight(
  weightKg: number,
  heightCm: number,
  gender: WhoGender
): LegacyZScore {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new ZScoreError('INVALID_WEIGHT', 'Berat badan tidak valid');
  }
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    throw new ZScoreError('INVALID_HEIGHT', 'Tinggi badan tidak valid');
  }
  return localLegacyResult('wfh', gender, heightCm, weightKg);
}

export default {
  lmsZScore,
  calculateZScore,
  computeAllZScores,
  categorizeZScore,
  calculateWeightForAge,
  calculateHeightForAge,
  calculateWeightForHeight,
  calculateAgeInMonths,
  determineStuntingRisk,
};
