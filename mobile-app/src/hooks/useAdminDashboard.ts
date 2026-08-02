/**
 * Admin domain hooks — stats + children list (RBAC: ROLE_ADMIN)
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/SupabaseClient';
import type { ChildRow, StuntingRisk } from '../types/database';

export const ADMIN_QUERY_KEY = ['admin'] as const;

export interface AdminChildRow extends ChildRow {
  parent_name?: string | null;
  parent_email?: string | null;
  latest_risk?: StuntingRisk | null;
  latest_height?: number | null;
  latest_weight?: number | null;
  latest_measured_at?: string | null;
}

export interface AdminDashboardStats {
  totalChildren: number;
  measurementsToday: number;
  stuntingCount: number;
  atRiskCount: number;
  recipesCount: number;
  whoStandardsCount: number;
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function useAdminDashboardStats(enabled = true) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'stats'],
    enabled,
    queryFn: async (): Promise<AdminDashboardStats> => {
      const today = startOfTodayIso();

      const [childrenRes, todayRes, stuntingRes, riskRes, recipesRes, whoRes] =
        await Promise.all([
          supabase.from('children').select('*', { count: 'exact', head: true }),
          supabase
            .from('measurements')
            .select('*', { count: 'exact', head: true })
            .gte('measured_at', today),
          supabase
            .from('measurements')
            .select('*', { count: 'exact', head: true })
            .in('stunting_risk', ['stunted', 'severe']),
          supabase
            .from('measurements')
            .select('*', { count: 'exact', head: true })
            .eq('stunting_risk', 'at_risk'),
          supabase.from('recipes').select('*', { count: 'exact', head: true }),
          supabase
            .from('who_standards')
            .select('*', { count: 'exact', head: true }),
        ]);

      const firstError =
        childrenRes.error ||
        todayRes.error ||
        stuntingRes.error ||
        riskRes.error ||
        recipesRes.error ||
        whoRes.error;
      if (firstError) throw new Error(firstError.message);

      return {
        totalChildren: childrenRes.count ?? 0,
        measurementsToday: todayRes.count ?? 0,
        stuntingCount: stuntingRes.count ?? 0,
        atRiskCount: riskRes.count ?? 0,
        recipesCount: recipesRes.count ?? 0,
        whoStandardsCount: whoRes.count ?? 0,
      };
    },
  });
}

export function useAdminChildren(enabled = true) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'children'],
    enabled,
    queryFn: async (): Promise<AdminChildRow[]> => {
      const { data, error, count } = await supabase
        .from('children')
        .select(
          `
          *,
          parent:profiles!parent_id (
            full_name,
            email
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      const children = (data ?? []) as Array<
        ChildRow & {
          parent?: { full_name?: string; email?: string } | null;
        }
      >;

      // Attach latest measurement risk (batched)
      const ids = children.map((c) => c.id);
      let latestByChild = new Map<
        string,
        {
          stunting_risk: StuntingRisk | null;
          height_cm: number;
          weight_kg: number | null;
          measured_at: string;
        }
      >();

      if (ids.length > 0) {
        const { data: measurements, error: mErr } = await supabase
          .from('measurements')
          .select(
            'child_id, height_cm, weight_kg, stunting_risk, measured_at',
            { count: 'exact' }
          )
          .in('child_id', ids)
          .order('measured_at', { ascending: false });

        if (mErr) throw new Error(mErr.message);

        for (const m of measurements ?? []) {
          const row = m as {
            child_id: string;
            height_cm: number;
            weight_kg: number | null;
            stunting_risk: StuntingRisk | null;
            measured_at: string;
          };
          if (!latestByChild.has(row.child_id)) {
            latestByChild.set(row.child_id, row);
          }
        }
      }

      void count;

      return children.map((c) => {
        const latest = latestByChild.get(c.id);
        return {
          ...c,
          parent_name: c.parent?.full_name ?? null,
          parent_email: c.parent?.email ?? null,
          latest_risk: latest?.stunting_risk ?? null,
          latest_height: latest?.height_cm ?? null,
          latest_weight: latest?.weight_kg ?? null,
          latest_measured_at: latest?.measured_at ?? null,
        };
      });
    },
  });
}

export function filterAdminChildren(
  rows: AdminChildRow[],
  query: string
): AdminChildRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((c) => {
    const name = c.name?.toLowerCase() ?? '';
    const parent = c.parent_name?.toLowerCase() ?? '';
    const email = c.parent_email?.toLowerCase() ?? '';
    return name.includes(q) || parent.includes(q) || email.includes(q);
  });
}

export function useFilteredAdminChildren(search: string, enabled = true) {
  const query = useAdminChildren(enabled);
  const filtered = useMemo(
    () => filterAdminChildren(query.data ?? [], search),
    [query.data, search]
  );
  return { ...query, filtered };
}
