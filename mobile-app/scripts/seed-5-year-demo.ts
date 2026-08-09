/**
 * BabyGrow — 5-Year Demo/Stress-Test Seeder
 * ------------------------------------------------------------------
 * Membuat 1 akun orang tua demo + 1 anak perempuan (lahir tepat 60 bulan lalu)
 * + 60 baris measurements (1 per bulan) yang mensimulasikan kurva pertumbuhan
 * NORMAL (kira-kira 0 s/d +0.5 SD terhadap standar WHO), lengkap dengan
 * jitter natural supaya grafik melengkung realistis (bukan garis robotik).
 *
 * Z-score dihitung memakai tabel LMS WHO yang SAMA dengan aplikasi
 * (src/constants/whoLocalFallback.ts) sehingga data pasti tervalidasi oleh
 * engine grafik & AI.
 *
 * ── CARA MENJALANKAN ──────────────────────────────────────────────
 *   1. Pastikan berada di folder mobile-app/
 *   2. Sediakan kredensial (service role WAJIB, agar bisa buat auth user
 *      & bypass RLS). Bisa lewat environment atau file .env:
 *        EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   (dari Supabase → Project Settings → API)
 *   3. Jalankan salah satu:
 *        npm run seed:demo
 *        npx tsx scripts/seed-5-year-demo.ts
 *        npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-5-year-demo.ts
 *
 *   Opsi:
 *        npx tsx scripts/seed-5-year-demo.ts --reset   # hapus anak demo lama dulu
 *
 * ⚠️  JANGAN commit SUPABASE_SERVICE_ROLE_KEY. Kunci ini setara admin.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  lookupLocalWhoLms,
  type WhoLmsPoint,
} from '../src/constants/whoLocalFallback';

// ── Konstanta akun demo ──────────────────────────────────────────
const DEMO_EMAIL = 'demo.parent@babygrow.app';
const DEMO_PASSWORD = 'Demo#12345';
const DEMO_PARENT_NAME = 'Orang Tua Demo';
const DEMO_CHILD_NAME = 'Balita Demo';
const DEMO_GENDER = 'female' as const;
const MONTHS = 60;

const BIRTH_WEIGHT_KG = 3.2;
const BIRTH_HEIGHT_CM = 50;

// ── WHO LMS math (identik dengan zScoreCalculator app) ───────────
/** Z = ((X/M)^L - 1) / (L*S)  |  L=0 → ln(X/M)/S */
function zFromLms(x: number, p: WhoLmsPoint): number {
  if (p.L === 0) return Math.log(x / p.M) / p.S;
  return (Math.pow(x / p.M, p.L) - 1) / (p.L * p.S);
}

/** Kebalikan: nilai X untuk sebuah target Z (untuk mensintesis data). */
function valueFromZ(z: number, p: WhoLmsPoint): number {
  if (p.L === 0) return p.M * Math.exp(p.S * z);
  return p.M * Math.pow(1 + p.L * p.S * z, 1 / p.L);
}

// ── Utilitas deterministik-acak (seeded) supaya hasil reprodusibel ─
function makeRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function round(value: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(value * f) / f;
}

function stuntingRisk(zHfa: number): 'normal' | 'at_risk' | 'stunted' | 'severe' {
  if (zHfa < -3) return 'severe';
  if (zHfa < -2) return 'stunted';
  if (zHfa < -1) return 'at_risk';
  return 'normal';
}

// ── Tanggal ──────────────────────────────────────────────────────
function monthsAgo(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() - months);
  return d;
}
function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}
function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── Loader .env sederhana (tanpa dependency tambahan) ────────────
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env } as Record<string, string>;
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'mobile-app', '.env'),
    // __dirname ada di mode CommonJS (default proyek ini); aman-kan untuk ESM.
    ...(typeof __dirname !== 'undefined' ? [resolve(__dirname, '..', '.env')] : []),
  ];
  for (const file of candidates) {
    try {
      const raw = readFileSync(file, 'utf8');
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (!(key in env) || !env[key]) env[key] = val;
      }
      break; // pakai file pertama yang ketemu
    } catch {
      // file tidak ada — lanjut kandidat berikutnya
    }
  }
  return env;
}

// ── Sintesis 60 baris measurement bergaya kurva NORMAL ───────────
interface SeedMeasurement {
  height_cm: number;
  weight_kg: number;
  z_score_hfa: number;
  z_score_wfa: number;
  z_score_wfh: number;
  stunting_risk: 'normal' | 'at_risk' | 'stunted' | 'severe';
  source: 'manual';
  device_id: string;
  measured_at: string;
}

function buildMeasurements(dob: Date): SeedMeasurement[] {
  const rng = makeRng(20260809); // seed tetap → data reprodusibel
  const rows: SeedMeasurement[] = [];

  for (let m = 1; m <= MONTHS; m += 1) {
    const hfa = lookupLocalWhoLms('hfa', DEMO_GENDER, m);
    const wfa = lookupLocalWhoLms('wfa', DEMO_GENDER, m);
    if (!hfa || !wfa) continue;

    // Target Z halus di pita sehat 0..+0.5 SD (gelombang lembut + jitter)
    const wave = 0.28 + 0.16 * Math.sin(m / 7);
    const zTargetH = Math.max(0, Math.min(0.5, wave + (rng() - 0.5) * 0.1));
    const zTargetW = Math.max(
      0,
      Math.min(0.5, 0.3 + 0.14 * Math.sin(m / 7 + 1.1) + (rng() - 0.5) * 0.1)
    );

    // Nilai dasar dari target Z, lalu tambahkan jitter fisik kecil
    let height = valueFromZ(zTargetH, hfa) + (rng() - 0.5) * 0.8; // ±0.4 cm
    let weight = valueFromZ(zTargetW, wfa) + (rng() - 0.5) * 0.2; // ±0.1 kg

    height = round(height, 1);
    weight = round(weight, 2);

    // Z-score FINAL dihitung dari nilai final → data internal konsisten
    const wfh = lookupLocalWhoLms('wfh', DEMO_GENDER, height);
    const zHfa = round(zFromLms(height, hfa), 2);
    const zWfa = round(zFromLms(weight, wfa), 2);
    const zWfh = wfh ? round(zFromLms(weight, wfh), 2) : zWfa;

    const measuredAt = addMonths(dob, m);

    rows.push({
      height_cm: height,
      weight_kg: weight,
      z_score_hfa: zHfa,
      z_score_wfa: zWfa,
      z_score_wfh: zWfh,
      stunting_risk: stuntingRisk(zHfa),
      source: 'manual',
      device_id: 'SEED-DEMO',
      measured_at: measuredAt.toISOString(),
    });
  }

  return rows;
}

// ── Supabase helpers ─────────────────────────────────────────────
async function ensureDemoUser(admin: SupabaseClient): Promise<string> {
  // Coba buat; jika sudah ada, cari di daftar user.
  const created = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_PARENT_NAME },
  });

  if (created.data?.user?.id) return created.data.user.id;

  const msg = created.error?.message ?? '';
  if (!/already|registered|exists/i.test(msg)) {
    throw new Error(`Gagal membuat user demo: ${msg}`);
  }

  // Sudah ada → cari id-nya
  for (let page = 1; page <= 20; page += 1) {
    const list = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (list.error) throw new Error(list.error.message);
    const found = list.data.users.find((u) => u.email === DEMO_EMAIL);
    if (found) return found.id;
    if (list.data.users.length < 200) break;
  }
  throw new Error('User demo sudah ada tapi id tidak ditemukan.');
}

async function upsertProfile(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin.from('profiles').upsert(
    {
      id: userId,
      email: DEMO_EMAIL,
      full_name: DEMO_PARENT_NAME,
      role: 'ROLE_USER',
    },
    { onConflict: 'id' }
  );
  if (error) throw new Error(`Gagal upsert profile: ${error.message}`);
}

async function resetExistingChild(
  admin: SupabaseClient,
  parentId: string
): Promise<void> {
  const { error } = await admin
    .from('children')
    .delete()
    .eq('parent_id', parentId)
    .eq('name', DEMO_CHILD_NAME);
  if (error) throw new Error(`Gagal reset anak demo: ${error.message}`);
}

async function createChild(
  admin: SupabaseClient,
  parentId: string,
  dob: Date
): Promise<string> {
  const { data, error } = await admin
    .from('children')
    .insert({
      parent_id: parentId,
      name: DEMO_CHILD_NAME,
      gender: DEMO_GENDER,
      date_of_birth: toDateOnly(dob),
      birth_weight: BIRTH_WEIGHT_KG,
      birth_height: BIRTH_HEIGHT_CM,
      mother_height_cm: 158,
      father_height_cm: 172,
      mother_blood: 'O',
      father_blood: 'A',
      child_blood: 'A',
    })
    .select('id')
    .single();
  if (error || !data) throw new Error(`Gagal membuat anak: ${error?.message}`);
  return data.id;
}

async function insertMeasurements(
  admin: SupabaseClient,
  childId: string,
  rows: SeedMeasurement[]
): Promise<void> {
  const payload = rows.map((r) => ({ child_id: childId, ...r }));
  const { error } = await admin.from('measurements').insert(payload);
  if (error) throw new Error(`Gagal insert measurements: ${error.message}`);
}

// ── MAIN ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const env = loadEnv();
  const url = env.EXPO_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey =
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || '';

  if (!url) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL tidak ditemukan di env/.env');
  }
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY wajib diisi (Project Settings → API → service_role).\n' +
        'Contoh: SUPABASE_SERVICE_ROLE_KEY=eyJ... npm run seed:demo'
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const reset = process.argv.includes('--reset');
  const now = new Date();
  const dob = monthsAgo(now, MONTHS);

  console.log('🌱 BabyGrow 5-Year Demo Seeder');
  console.log('   Target :', url);
  console.log('   Anak   :', DEMO_CHILD_NAME, `(${DEMO_GENDER})`);
  console.log('   Lahir  :', toDateOnly(dob), '(tepat 60 bulan lalu)');

  const userId = await ensureDemoUser(admin);
  console.log('✅ Akun demo siap  →', DEMO_EMAIL, `(id ${userId.slice(0, 8)}…)`);

  await upsertProfile(admin, userId);
  console.log('✅ Profile diselaraskan');

  if (reset) {
    await resetExistingChild(admin, userId);
    console.log('🧹 Anak demo lama dihapus (--reset)');
  }

  const childId = await createChild(admin, userId, dob);
  console.log('✅ Anak dibuat     →', DEMO_CHILD_NAME, `(id ${childId.slice(0, 8)}…)`);

  const rows = buildMeasurements(dob);
  await insertMeasurements(admin, childId, rows);

  const first = rows[0];
  const last = rows[rows.length - 1];
  console.log(`✅ ${rows.length} measurement tersimpan`);
  console.log(
    `   Bulan 1 : ${first.height_cm} cm / ${first.weight_kg} kg (z_hfa ${first.z_score_hfa})`
  );
  console.log(
    `   Bulan 60: ${last.height_cm} cm / ${last.weight_kg} kg (z_hfa ${last.z_score_hfa})`
  );
  console.log('\n🎉 Selesai. Login di app dengan:');
  console.log(`   Email    : ${DEMO_EMAIL}`);
  console.log(`   Password : ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error('\n❌ Seeder gagal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
