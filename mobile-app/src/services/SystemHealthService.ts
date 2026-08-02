/**
 * System Health Check — Admin smoke test (Supabase + MQTT + seed tables)
 */

import { supabase } from '../services/SupabaseClient';
import MQTTService from '../services/MQTTService';

export type HealthStatus = 'ok' | 'warn' | 'fail';

export interface HealthCheckItem {
  id: string;
  label: string;
  status: HealthStatus;
  detail: string;
}

export interface SystemHealthReport {
  checkedAt: string;
  items: HealthCheckItem[];
  overall: HealthStatus;
}

async function countExact(table: string): Promise<{ count: number; error?: string }> {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0 };
}

function worst(statuses: HealthStatus[]): HealthStatus {
  if (statuses.includes('fail')) return 'fail';
  if (statuses.includes('warn')) return 'warn';
  return 'ok';
}

export async function runSystemHealthCheck(): Promise<SystemHealthReport> {
  const items: HealthCheckItem[] = [];

  // Supabase connectivity via profiles head count
  try {
    const { error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (error) {
      items.push({
        id: 'supabase',
        label: 'Cloud',
        status: 'fail',
        detail: error.message,
      });
    } else {
      items.push({
        id: 'supabase',
        label: 'Cloud',
        status: 'ok',
        detail: 'Koneksi OK',
      });
    }
  } catch (e) {
    items.push({
      id: 'supabase',
      label: 'Cloud',
      status: 'fail',
      detail: e instanceof Error ? e.message : 'Unreachable',
    });
  }

  // Core tables
  for (const table of ['profiles', 'children', 'measurements'] as const) {
    const res = await countExact(table);
    items.push({
      id: `table_${table}`,
      label: `Tabel ${table}`,
      status: res.error ? 'fail' : 'ok',
      detail: res.error ?? `${res.count} baris`,
    });
  }

  // Seed: who_standards
  const who = await countExact('who_standards');
  items.push({
    id: 'seed_who',
    label: 'Seed WHO standards',
    status: who.error ? 'fail' : who.count >= 100 ? 'ok' : who.count > 0 ? 'warn' : 'fail',
    detail: who.error
      ? who.error
      : who.count >= 100
        ? `${who.count} baris LMS (OK)`
        : who.count > 0
          ? `${who.count} baris — seed tidak lengkap`
          : 'Data standar belum tersedia',
  });

  // Seed: recipes
  const recipes = await countExact('recipes');
  items.push({
    id: 'seed_recipes',
    label: 'Seed resep MBG',
    status: recipes.error
      ? 'fail'
      : recipes.count >= 10
        ? 'ok'
        : recipes.count > 0
          ? 'warn'
          : 'fail',
    detail: recipes.error
      ? recipes.error
      : recipes.count >= 10
        ? `${recipes.count} resep (OK)`
        : recipes.count > 0
          ? `${recipes.count} resep — seed tidak lengkap`
          : 'Data standar belum tersedia',
  });

  // MQTT
  const mqtt = MQTTService.getInstance();
  const mqttOk = mqtt.isConnected();
  items.push({
    id: 'mqtt',
    label: 'Koneksi alat',
    status: mqttOk ? 'ok' : 'warn',
    detail: mqttOk
      ? `Connected (${mqtt.getStatus().broker})`
      : 'Belum terhubung (opsional untuk admin)',
  });

  return {
    checkedAt: new Date().toISOString(),
    items,
    overall: worst(items.map((i) => i.status)),
  };
}
