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
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format tanggal: DD/MM/YYYY (contoh 15/05/2024)')
    .refine((value) => {
      const iso = parseBirthDateToIso(value);
      if (!iso) return false;
      const d = new Date(iso);
      return !Number.isNaN(d.getTime()) && d <= new Date();
    }, 'Tanggal lahir tidak valid'),
  birthWeight: z.preprocess(
    (v) => (typeof v === 'string' && !v.trim() ? undefined : v),
    z
      .string()
      .optional()
      .refine(
        (v) =>
          v === undefined ||
          (!Number.isNaN(Number(String(v).replace(',', '.'))) &&
            Number(String(v).replace(',', '.')) > 0 &&
            Number(String(v).replace(',', '.')) < 10),
        'Berat lahir harus antara 0–10 kg'
      )
  ),
  birthHeight: z.preprocess(
    (v) => (typeof v === 'string' && !v.trim() ? undefined : v),
    z
      .string()
      .optional()
      .refine(
        (v) =>
          v === undefined ||
          (!Number.isNaN(Number(String(v).replace(',', '.'))) &&
            Number(String(v).replace(',', '.')) > 20 &&
            Number(String(v).replace(',', '.')) < 70),
        'Tinggi lahir harus antara 20–70 cm'
      )
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
  mother_height_cm?: number | null;
  father_height_cm?: number | null;
  mother_weight_kg?: number | null;
  father_weight_kg?: number | null;
  mother_blood?: string | null;
  father_blood?: string | null;
  child_blood?: string | null;
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

/** Convert YYYY-MM-DD (or Date string) → DD/MM/YYYY for form UI */
export function formatIsoToBirthDate(value: string): string {
  const trimmed = value?.trim() ?? '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function mapFormToCreateInput(values: CreateChildFormOutput): CreateChildInput {
  const date_of_birth = parseBirthDateToIso(values.birthDate);
  if (!date_of_birth) {
    throw new Error('Tanggal lahir tidak valid');
  }
  const toNum = (v?: string) => {
    if (!v?.trim()) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };
  return {
    name: values.name.trim(),
    gender: values.gender,
    date_of_birth,
    birth_weight: toNum(values.birthWeight as string | undefined),
    birth_height: toNum(values.birthHeight as string | undefined),
  };
}

async function resolveParentId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Sesi tidak ditemukan. Silakan login ulang.');
  return userId;
}

/** Pastikan baris profiles ada (FK parent_id). Gagal diam-diam → tetap lanjut insert. */
export async function ensureOwnProfile(userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (existing?.id) return;

  const { data: auth } = await supabase.auth.getUser();
  const email = auth.user?.email ?? `${userId}@local`;
  const fullName =
    (auth.user?.user_metadata?.full_name as string | undefined) ||
    email.split('@')[0] ||
    'Pengguna';

  // Coba dengan role_app; jika kolom tidak ada, coba minimal
  const attempts = [
    { id: userId, email, full_name: fullName, role: 'ROLE_USER', role_app: 'ROLE_USER' },
    { id: userId, email, full_name: fullName, role: 'ROLE_USER' },
    { id: userId, email, full_name: fullName },
  ];
  for (const row of attempts) {
    const { error } = await supabase.from('profiles').insert(row as any);
    if (!error) return;
    if (!/column|schema cache|role_app/i.test(error.message)) {
      // RLS / lainnya — biarkan insert anak yang menampilkan error FK
      return;
    }
  }
}

function normalizeBlood(v?: string | null): string | null {
  if (!v) return null;
  const t = v.trim().toUpperCase();
  return t === 'A' || t === 'B' || t === 'AB' || t === 'O' ? t : null;
}

/** Pesan error yang bisa ditindaklanjuti (RLS / FK profil / validasi). */
function formatChildSaveError(
  message: string,
  code?: string,
  details?: string | null,
  hint?: string | null
): string {
  const raw = [message, details, hint].filter(Boolean).join(' | ');
  const m = raw.toLowerCase();
  if (
    m.includes('row-level security') ||
    m.includes('rls') ||
    code === '42501'
  ) {
    return (
      'Akses ditolak oleh keamanan database. ' +
      'Jalankan supabase/fix-save-child.sql di SQL Editor, lalu coba lagi.\n\n' +
      raw
    );
  }
  if (
    m.includes('foreign key') ||
    m.includes('parent_id') ||
    code === '23503'
  ) {
    return (
      'Profil akun belum ada di database. ' +
      'Jalankan supabase/fix-save-child.sql, lalu logout & login ulang.\n\n' +
      raw
    );
  }
  if (m.includes('jwt') || m.includes('session') || code === 'PGRST301') {
    return 'Sesi habis. Silakan keluar lalu masuk lagi.';
  }
  // Jangan samarkan semua "could not find" sebagai migrate ortu —
  // tampilkan pesan asli supaya jelas kolom mana yang bermasalah
  if (code === 'PGRST204' || m.includes('schema cache') || m.includes('could not find')) {
    return (
      'Struktur tabel children di Supabase belum cocok dengan app. ' +
      'Jalankan supabase/fix-children-align-app.sql lalu tunggu ~30 detik.\n\n' +
      raw
    );
  }
  const extra = [code, details, hint].filter(Boolean).join(' — ');
  return extra ? `${message} (${extra})` : message || 'Gagal menyimpan data anak';
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
        return ((data ?? []) as Record<string, unknown>[]).map(normalizeChildRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data anak';
        throw new Error(message);
      }
    },
  });
}

/** Samakan alias kolom lama (full_name / birth_date) → bentuk app. */
function normalizeChildRow(row: Record<string, unknown>): ChildRow {
  const name = String(row.name ?? row.full_name ?? row.nama ?? row.child_name ?? '');
  const date_of_birth = String(
    row.date_of_birth ?? row.birth_date ?? row.dob ?? row.tanggal_lahir ?? ''
  );
  return {
    ...(row as unknown as ChildRow),
    name,
    date_of_birth,
  };
}

export interface UpdateChildInput {
  id: string;
  name: string;
  gender: Gender;
  date_of_birth: string; // YYYY-MM-DD
  birth_weight?: number | null;
  birth_height?: number | null;
  child_blood?: string | null;
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateChildInput): Promise<ChildRow> => {
      try {
        const dualWrite = {
          name: input.name,
          full_name: input.name,
          gender: input.gender,
          date_of_birth: input.date_of_birth,
          birth_date: input.date_of_birth,
        };

        const payloadVariants: Record<string, unknown>[] = [
          dualWrite,
          {
            name: input.name,
            gender: input.gender,
            date_of_birth: input.date_of_birth,
          },
          {
            full_name: input.name,
            gender: input.gender,
            birth_date: input.date_of_birth,
          },
          {
            full_name: input.name,
            gender: input.gender,
            date_of_birth: input.date_of_birth,
          },
          {
            name: input.name,
            gender: input.gender,
            birth_date: input.date_of_birth,
          },
        ];

        let data: ChildRow | null = null;
        let lastError: {
          message: string;
          code?: string;
          details?: string;
          hint?: string;
        } | null = null;

        for (const payload of payloadVariants) {
          const attempt = await supabase
            .from('children')
            .update(payload)
            .eq('id', input.id)
            .select('*')
            .single();

          if (!attempt.error && attempt.data) {
            data = normalizeChildRow(attempt.data as Record<string, unknown>);
            lastError = null;
            break;
          }

          lastError = {
            message: attempt.error?.message ?? 'unknown',
            code: attempt.error?.code,
            details: attempt.error?.details ?? undefined,
            hint: attempt.error?.hint ?? undefined,
          };

          const msg = (attempt.error?.message ?? '').toLowerCase();
          if (
            msg.includes('row-level security') ||
            msg.includes('foreign key') ||
            msg.includes('invalid input value for enum') ||
            attempt.error?.code === '23503' ||
            attempt.error?.code === '42501'
          ) {
            break;
          }
        }

        if (!data) {
          throw new Error(
            formatChildSaveError(
              lastError?.message ?? 'Gagal memperbarui',
              lastError?.code,
              lastError?.details,
              lastError?.hint
            )
          );
        }

        const optionalPatch: Record<string, unknown> = {};
        if (input.birth_weight !== undefined) {
          optionalPatch.birth_weight = input.birth_weight;
        }
        if (input.birth_height !== undefined) {
          optionalPatch.birth_height = input.birth_height;
        }
        if (input.child_blood !== undefined) {
          optionalPatch.child_blood = normalizeBlood(input.child_blood);
        }

        if (Object.keys(optionalPatch).length > 0) {
          const { data: updated, error: upErr } = await supabase
            .from('children')
            .update(optionalPatch)
            .eq('id', input.id)
            .select('*')
            .single();
          if (!upErr && updated) {
            data = normalizeChildRow(updated as Record<string, unknown>);
          }
        }

        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Gagal memperbarui data anak';
        throw new Error(message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
    },
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateChildInput): Promise<ChildRow> => {
      try {
        const parent_id = await resolveParentId();
        await ensureOwnProfile(parent_id);

        // Dual-write: schema BabyGrow (name/date_of_birth) + schema lama (full_name/birth_date)
        const dualWrite = {
          parent_id,
          name: input.name,
          full_name: input.name,
          gender: input.gender,
          date_of_birth: input.date_of_birth,
          birth_date: input.date_of_birth,
        };

        const payloadVariants: Record<string, unknown>[] = [
          dualWrite,
          {
            parent_id,
            name: input.name,
            gender: input.gender,
            date_of_birth: input.date_of_birth,
          },
          {
            parent_id,
            full_name: input.name,
            gender: input.gender,
            birth_date: input.date_of_birth,
          },
          {
            parent_id,
            full_name: input.name,
            gender: input.gender,
            date_of_birth: input.date_of_birth,
          },
          {
            parent_id,
            name: input.name,
            gender: input.gender,
            birth_date: input.date_of_birth,
          },
        ];

        let data: ChildRow | null = null;
        let lastError: { message: string; code?: string; details?: string; hint?: string } | null =
          null;

        for (const payload of payloadVariants) {
          const attempt = await supabase
            .from('children')
            .insert(payload)
            .select('*')
            .single();

          if (!attempt.error && attempt.data) {
            data = normalizeChildRow(attempt.data as Record<string, unknown>);
            lastError = null;
            break;
          }

          lastError = {
            message: attempt.error?.message ?? 'unknown',
            code: attempt.error?.code,
            details: attempt.error?.details ?? undefined,
            hint: attempt.error?.hint ?? undefined,
          };

          const msg = (attempt.error?.message ?? '').toLowerCase();
          if (
            msg.includes('row-level security') ||
            msg.includes('foreign key') ||
            msg.includes('invalid input value for enum') ||
            attempt.error?.code === '23503' ||
            attempt.error?.code === '42501'
          ) {
            break;
          }
        }

        if (!data) {
          throw new Error(
            formatChildSaveError(
              lastError?.message ?? 'Gagal menyimpan',
              lastError?.code,
              lastError?.details,
              lastError?.hint
            )
          );
        }

        const childId = data.id as string;

        const patches: Record<string, unknown>[] = [
          {
            birth_weight: input.birth_weight,
            birth_height: input.birth_height,
            photo_url: null,
          },
          {
            mother_height_cm: input.mother_height_cm ?? null,
            father_height_cm: input.father_height_cm ?? null,
            mother_weight_kg: input.mother_weight_kg ?? null,
            father_weight_kg: input.father_weight_kg ?? null,
            mother_blood: normalizeBlood(input.mother_blood),
            father_blood: normalizeBlood(input.father_blood),
            child_blood: normalizeBlood(input.child_blood),
          },
        ];

        let latest = data;
        for (const patch of patches) {
          const cleaned = Object.fromEntries(
            Object.entries(patch).filter(([, v]) => v !== undefined)
          );
          if (Object.keys(cleaned).length === 0) continue;
          const { data: updated, error: upErr } = await supabase
            .from('children')
            .update(cleaned)
            .eq('id', childId)
            .select('*')
            .single();
          if (!upErr && updated) {
            latest = normalizeChildRow(updated as Record<string, unknown>);
          }
        }

        return latest;
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
