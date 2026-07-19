/**
 * React Query hooks — Children & Measurements (Supabase)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/SupabaseClient';
import type { ChildRow, MeasurementRow } from '../types/database';

export function useChildren(options?: { parentId?: string | null; fetchAll?: boolean }) {
  const parentId = options?.parentId;
  const fetchAll = options?.fetchAll ?? false;

  return useQuery({
    queryKey: ['children', fetchAll ? 'all' : parentId],
    enabled: fetchAll || !!parentId,
    queryFn: async (): Promise<ChildRow[]> => {
      let query = supabase.from('children').select('*').order('created_at', { ascending: false });
      if (!fetchAll && parentId) {
        query = query.eq('parent_id', parentId);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as ChildRow[];
    },
  });
}

export function useChildMeasurements(childId?: string | null) {
  return useQuery({
    queryKey: ['measurements', childId],
    enabled: !!childId,
    queryFn: async (): Promise<MeasurementRow[]> => {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('child_id', childId!)
        .order('measured_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as MeasurementRow[];
    },
  });
}

export function ageLabelFromDob(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let months =
    (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) months -= 1;
  if (months < 0) months = 0;
  if (months < 12) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years} th ${rem} bln` : `${years} tahun`;
}
