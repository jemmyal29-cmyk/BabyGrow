/**
 * Measurements domain — React Query + Supabase realtime
 * Business logic for persisting MQTT/manual readings with WHO Z-Scores
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/SupabaseClient';
import { queryClient } from '../services/queryClient';
import { colors } from '../theme';
import type { Gender, MeasurementRow, StuntingRisk } from '../types/database';
import {
  calculateAgeInMonths,
  calculateHeightForAge,
  calculateWeightForAge,
  calculateWeightForHeight,
  determineStuntingRisk,
} from '../utils/zScoreCalculator';

export const MEASUREMENTS_QUERY_KEY = ['measurements'] as const;

/** Invalidate measurement queries after MQTT/offline sync insert (non-React) */
export function invalidateMeasurementQueries(childId?: string | null): void {
  void queryClient.invalidateQueries({ queryKey: MEASUREMENTS_QUERY_KEY });
  if (childId) {
    void queryClient.invalidateQueries({
      queryKey: [...MEASUREMENTS_QUERY_KEY, 'latest', childId],
    });
    void queryClient.invalidateQueries({
      queryKey: [...MEASUREMENTS_QUERY_KEY, childId],
    });
  }
}

export interface SaveMeasurementInput {
  child_id: string;
  height_cm: number;
  weight_kg?: number | null;
  head_circumference_cm?: number | null;
  source: MeasurementRow['source'];
  device_id?: string | null;
  measured_at?: string;
  /** Required for Z-score */
  gender: Gender;
  date_of_birth: string;
}

export interface MeasurementWithZScores {
  height_cm: number;
  weight_kg: number | null;
  z_score_hfa: number | null;
  z_score_wfa: number | null;
  z_score_wfh: number | null;
  stunting_risk: StuntingRisk | null;
}

function mapStuntingRisk(
  level: ReturnType<typeof determineStuntingRisk>['level']
): StuntingRisk {
  if (level === 'severely_stunted') return 'severe';
  return level;
}

/** Pure calculator — used by MQTT bridge and UI */
export function computeMeasurementZScores(params: {
  height_cm: number;
  weight_kg?: number | null;
  gender: Gender;
  date_of_birth: string;
}): MeasurementWithZScores {
  const ageMonths = calculateAgeInMonths(params.date_of_birth);
  const hfa = calculateHeightForAge(params.height_cm, ageMonths, params.gender);
  const risk = determineStuntingRisk(hfa.zscore);

  let z_score_wfa: number | null = null;
  let z_score_wfh: number | null = null;
  const weight = params.weight_kg && params.weight_kg > 0 ? params.weight_kg : null;

  if (weight) {
    z_score_wfa = calculateWeightForAge(weight, ageMonths, params.gender).zscore;
    z_score_wfh = calculateWeightForHeight(weight, params.height_cm, params.gender).zscore;
  }

  return {
    height_cm: params.height_cm,
    weight_kg: weight,
    z_score_hfa: hfa.zscore,
    z_score_wfa,
    z_score_wfh,
    stunting_risk: mapStuntingRisk(risk.level),
  };
}

/** Shared persistence (callable outside React — MQTT singleton) */
export async function persistMeasurement(
  input: SaveMeasurementInput
): Promise<MeasurementRow> {
  try {
    if (!input.child_id) {
      throw new Error('child_id wajib untuk menyimpan pengukuran');
    }
    if (!input.height_cm || input.height_cm <= 0) {
      throw new Error('Tinggi badan tidak valid');
    }

    const scores = computeMeasurementZScores({
      height_cm: input.height_cm,
      weight_kg: input.weight_kg,
      gender: input.gender,
      date_of_birth: input.date_of_birth,
    });

    const { data, error } = await supabase
      .from('measurements')
      .insert({
        child_id: input.child_id,
        height_cm: scores.height_cm,
        weight_kg: scores.weight_kg,
        head_circumference_cm: input.head_circumference_cm ?? null,
        z_score_hfa: scores.z_score_hfa,
        z_score_wfa: scores.z_score_wfa,
        z_score_wfh: scores.z_score_wfh,
        stunting_risk: scores.stunting_risk,
        source: input.source,
        device_id: input.device_id ?? null,
        measured_at: input.measured_at ?? new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Gagal menyimpan pengukuran');
    return data as MeasurementRow;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan pengukuran';
    throw new Error(message);
  }
}

export function useSaveMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: persistMeasurement,
    onSuccess: async (row) => {
      await queryClient.invalidateQueries({ queryKey: MEASUREMENTS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: [...MEASUREMENTS_QUERY_KEY, 'latest', row.child_id],
      });
      await queryClient.invalidateQueries({
        queryKey: [...MEASUREMENTS_QUERY_KEY, row.child_id],
      });
    },
  });
}

export function useChildMeasurements(childId?: string | null) {
  return useQuery({
    queryKey: [...MEASUREMENTS_QUERY_KEY, childId],
    enabled: !!childId,
    queryFn: async (): Promise<MeasurementRow[]> => {
      try {
        const { data, error } = await supabase
          .from('measurements')
          .select('*')
          .eq('child_id', childId!)
          .order('measured_at', { ascending: true });
        if (error) throw new Error(error.message);
        return (data ?? []) as MeasurementRow[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat pengukuran';
        throw new Error(message);
      }
    },
  });
}

/**
 * Latest measurement for a child + realtime INSERT subscription
 */
export function useLatestMeasurement(childId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => [...MEASUREMENTS_QUERY_KEY, 'latest', childId ?? 'none'] as const,
    [childId]
  );

  const query = useQuery({
    queryKey,
    enabled: !!childId,
    queryFn: async (): Promise<MeasurementRow | null> => {
      try {
        const { data, error } = await supabase
          .from('measurements')
          .select('*')
          .eq('child_id', childId!)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw new Error(error.message);
        return (data as MeasurementRow) ?? null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat pengukuran terbaru';
        throw new Error(message);
      }
    },
  });

  useEffect(() => {
    if (!childId) return;

    const channel = supabase
      .channel(`measurements-child-${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'measurements',
          filter: `child_id=eq.${childId}`,
        },
        (payload) => {
          const row = payload.new as MeasurementRow;
          // Ignore stale events if user switched child
          if (row.child_id !== childId) return;
          queryClient.setQueryData(queryKey, row);
          void queryClient.invalidateQueries({
            queryKey: [...MEASUREMENTS_QUERY_KEY, childId],
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [childId, queryClient, queryKey]);

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { ...query, invalidate };
}

export interface StuntingDisplay {
  risk: StuntingRisk;
  label: string;
  color: string;
  zScore: number | null;
}

/** Map WHO HFA / stored risk → UI label + theme color */
export function getStuntingDisplay(params: {
  stunting_risk?: StuntingRisk | null;
  z_score_hfa?: number | null;
  z_score_wfa?: number | null;
}): StuntingDisplay | null {
  const z =
    params.z_score_hfa != null
      ? params.z_score_hfa
      : params.z_score_wfa != null
        ? params.z_score_wfa
        : null;

  let risk: StuntingRisk | null = params.stunting_risk ?? null;
  if (!risk && z != null) {
    risk = mapStuntingRisk(determineStuntingRisk(z).level);
  }
  if (!risk) return null;

  const map: Record<StuntingRisk, { label: string; color: string }> = {
    normal: { label: 'Normal', color: colors.stunting.normal },
    at_risk: { label: 'Berisiko', color: colors.stunting.atRisk },
    stunted: { label: 'Stunting', color: colors.stunting.stunted },
    severe: { label: 'Stunting Berat', color: colors.stunting.severelyStunted },
  };

  return {
    risk,
    label: map[risk].label,
    color: map[risk].color,
    zScore: z,
  };
}
