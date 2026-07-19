/**
 * Children domain hooks — React Query (server state)
 * Query + Mutation for Supabase `children` table
 */

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '../services/SupabaseClient';
import type { ChildRow, Gender } from '../types/database';

export const CHILDREN_QUERY_KEY = ['children'] as const;

export const createChildSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(80, 'Nama terlalu panjang'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Jenis kelamin wajib dipilih' }),
  }),
  /** UI format DD/MM/YYYY */
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format tanggal: DD/MM/YYYY')
    .refine((value) => {
      const iso = parseBirthDateToIso(value);
      if (!iso) return false;
      const d = new Date(iso);
      return !Number.isNaN(d.getTime()) && d <= new Date();
    }, 'Tanggal lahir tidak valid'),
  birthWeight: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine(
      (v) => v === undefined || (!Number.isNaN(Number(v)) && Number(v) > 0 && Number(v) < 10),
      'Berat lahir harus antara 0–10 kg'
    ),
  birthHeight: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine(
      (v) => v === undefined || (!Number.isNaN(Number(v)) && Number(v) > 20 && Number(v) < 70),
      'Tinggi lahir harus antara 20–70 cm'
    ),
});

export type CreateChildFormValues = z.input<typeof createChildSchema>;
export type CreateChildFormOutput = z.output<typeof createChildSchema>;

export interface CreateChildInput {
  name: string;
  gender: Gender;
  date_of_birth: string; // YYYY-MM-DD
  birth_weight: number | null;
  birth_height: number | null;
}

/** Convert DD/MM/YYYY → YYYY-MM-DD */
export function parseBirthDateToIso(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const iso = `${yyyy}-${mm}-${dd}`;
  const d = new Date(`${iso}T00:00:00`);
  if (
    d.getFullYear() !== year ||
    d.getMonth() + 1 !== month ||
    d.getDate() !== day
  ) {
    return null;
  }
  return iso;
}

export function mapFormToCreateInput(values: CreateChildFormOutput): CreateChildInput {
  const date_of_birth = parseBirthDateToIso(values.birthDate);
  if (!date_of_birth) {
    throw new Error('Tanggal lahir tidak valid');
  }
  return {
    name: values.name.trim(),
    gender: values.gender,
    date_of_birth,
    birth_weight: values.birthWeight ? Number(values.birthWeight) : null,
    birth_height: values.birthHeight ? Number(values.birthHeight) : null,
  };
}

async function resolveParentId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Sesi tidak ditemukan. Silakan login ulang.');
  return userId;
}

export function useChildren(options?: { parentId?: string | null; fetchAll?: boolean }) {
  const parentId = options?.parentId;
  const fetchAll = options?.fetchAll ?? false;

  return useQuery({
    queryKey: [...CHILDREN_QUERY_KEY, fetchAll ? 'all' : parentId ?? 'none'],
    enabled: fetchAll || !!parentId,
    queryFn: async (): Promise<ChildRow[]> => {
      try {
        let query = supabase
          .from('children')
          .select('*')
          .order('created_at', { ascending: false });
        if (!fetchAll && parentId) {
          query = query.eq('parent_id', parentId);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data ?? []) as ChildRow[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data anak';
        throw new Error(message);
      }
    },
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateChildInput): Promise<ChildRow> => {
      try {
        const parent_id = await resolveParentId();
        const { data, error } = await supabase
          .from('children')
          .insert({
            parent_id,
            name: input.name,
            gender: input.gender,
            date_of_birth: input.date_of_birth,
            birth_weight: input.birth_weight,
            birth_height: input.birth_height,
            photo_url: null,
          })
          .select('*')
          .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error('Gagal menyimpan data anak');
        return data as ChildRow;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal menyimpan data anak';
        throw new Error(message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
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

/** Stable invalidate helper for screens/hooks */
export function useInvalidateChildren() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY }),
    [queryClient]
  );
}

/** @deprecated Use `useChildMeasurements` from `./useMeasurements` */
export { useChildMeasurements } from './useMeasurements';
