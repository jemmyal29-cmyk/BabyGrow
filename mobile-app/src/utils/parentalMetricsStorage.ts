/**
 * Cadangan lokal data orang tua (AsyncStorage).
 * Sumber utama sekarang: kolom di tabel `children` (cloud).
 * Jalankan migrate-parental-metrics.sql di Supabase.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BloodTypeInput, ParentalMetricsInput } from './parentalGrowth';

const keyFor = (childId: string) => `@babygrow/parental_metrics_${childId}`;

export type StoredParentalMetrics = ParentalMetricsInput & {
  childId: string;
  updatedAt: string;
};

export async function saveParentalMetrics(
  childId: string,
  metrics: ParentalMetricsInput
): Promise<void> {
  const payload: StoredParentalMetrics = {
    ...metrics,
    childId,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(keyFor(childId), JSON.stringify(payload));
}

export async function loadParentalMetrics(
  childId: string
): Promise<StoredParentalMetrics | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(childId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredParentalMetrics;
  } catch {
    return null;
  }
}

export function parseOptionalNumber(v?: string): number | undefined {
  if (!v?.trim()) return undefined;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

export function parseBlood(v?: string): BloodTypeInput {
  const t = (v || '').trim().toUpperCase();
  if (t === 'A' || t === 'B' || t === 'AB' || t === 'O') return t;
  return '';
}
