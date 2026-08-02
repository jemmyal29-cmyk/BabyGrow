-- =============================================================================
-- BabyGrow SEED DATA — Import langsung di Supabase SQL Editor
-- STEP 1: Data Seeding (WHO Standards 0–24 bln + 10 resep MBG)
-- Idempotent: ON CONFLICT DO NOTHING
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) DDL — recreate tabel referensi (aman: bukan data user)
--    Kenapa DROP: CREATE IF NOT EXISTS tidak memperbaiki skema lama
--    yang mungkin tanpa kolom `indicator`.
-- -----------------------------------------------------------------------------

drop table if exists public.who_standards cascade;
drop table if exists public.recipes cascade;

create table public.who_standards (
  id uuid primary key default gen_random_uuid(),
  indicator text not null check (indicator in ('wfa', 'hfa', 'wfh')),
  gender text not null check (gender in ('male', 'female')),
  age_months int not null check (age_months >= 0 and age_months <= 60),
  l numeric not null,
  m numeric not null,
  s numeric not null,
  created_at timestamptz not null default now(),
  unique (indicator, gender, age_months)
);

create index idx_who_standards_lookup
  on public.who_standards (indicator, gender, age_months);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('breakfast', 'lunch', 'dinner', 'snack')),
  age_min_months int not null default 6,
  age_max_months int not null default 60,
  calories numeric not null,
  protein_g numeric not null,
  fat_g numeric,
  carbs_g numeric,
  ingredients text[] not null,
  instructions text[] not null,
  is_high_protein boolean not null default false,
  is_mbg_eligible boolean not null default true,
  priority int not null default 1,
  created_at timestamptz not null default now()
);

create index idx_recipes_category on public.recipes (category);
create index idx_recipes_mbg on public.recipes (is_mbg_eligible);

-- RLS: data referensi publik (read-only untuk authenticated)
alter table public.who_standards enable row level security;
alter table public.recipes enable row level security;

drop policy if exists "Anyone authenticated can read who_standards" on public.who_standards;
create policy "Anyone authenticated can read who_standards"
  on public.who_standards for select
  to authenticated
  using (true);

drop policy if exists "Anyone authenticated can read recipes" on public.recipes;
create policy "Anyone authenticated can read recipes"
  on public.recipes for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- 1) WHO STANDARDS — LMS (WFA + HFA) × (male + female) × bulan 0–24
-- Catatan: nilai diisi dari standar WHO Child Growth Standards (LMS method),
-- dengan interpolasi bulanan antar titik referensi resmi.
-- -----------------------------------------------------------------------------

insert into public.who_standards (indicator, gender, age_months, l, m, s)
values
  ('wfa', 'male', 0, 0.3487, 3.3464, 0.14602),
  ('wfa', 'male', 1, 0.3487, 4.4709, 0.13395),
  ('wfa', 'male', 2, 0.3487, 5.5675, 0.12385),
  ('wfa', 'male', 3, 0.3487, 6.3762, 0.11727),
  ('wfa', 'male', 4, 0.3487, 7.002, 0.1145),
  ('wfa', 'male', 5, 0.3487, 7.51, 0.1136),
  ('wfa', 'male', 6, 0.3487, 7.934, 0.11316),
  ('wfa', 'male', 7, 0.3487, 8.299, 0.1135),
  ('wfa', 'male', 8, 0.3487, 8.628, 0.1142),
  ('wfa', 'male', 9, 0.3487, 8.925, 0.115),
  ('wfa', 'male', 10, 0.3487, 9.2, 0.1158),
  ('wfa', 'male', 11, 0.3487, 9.445, 0.1165),
  ('wfa', 'male', 12, 0.3487, 9.6479, 0.11727),
  ('wfa', 'male', 13, 0.3487, 9.9173, 0.11711),
  ('wfa', 'male', 14, 0.3487, 10.1866, 0.11696),
  ('wfa', 'male', 15, 0.3487, 10.456, 0.1168),
  ('wfa', 'male', 16, 0.3487, 10.6707, 0.1166),
  ('wfa', 'male', 17, 0.3487, 10.8853, 0.1164),
  ('wfa', 'male', 18, 0.3487, 11.1, 0.1162),
  ('wfa', 'male', 19, 0.3487, 11.2933, 0.1161),
  ('wfa', 'male', 20, 0.3487, 11.4867, 0.116),
  ('wfa', 'male', 21, 0.3487, 11.68, 0.1159),
  ('wfa', 'male', 22, 0.3487, 11.8555, 0.11583),
  ('wfa', 'male', 23, 0.3487, 12.0309, 0.11575),
  ('wfa', 'male', 24, 0.3487, 12.2064, 0.11568),
  ('hfa', 'male', 0, 1, 49.8842, 0.03795),
  ('hfa', 'male', 1, 1, 54.7244, 0.03557),
  ('hfa', 'male', 2, 1, 58.424, 0.0351),
  ('hfa', 'male', 3, 1, 61.4292, 0.03486),
  ('hfa', 'male', 4, 1, 63.89, 0.0349),
  ('hfa', 'male', 5, 1, 65.9, 0.03495),
  ('hfa', 'male', 6, 1, 67.6236, 0.03497),
  ('hfa', 'male', 7, 1, 69.15, 0.0351),
  ('hfa', 'male', 8, 1, 70.56, 0.0353),
  ('hfa', 'male', 9, 1, 71.86, 0.0355),
  ('hfa', 'male', 10, 1, 73.1, 0.0357),
  ('hfa', 'male', 11, 1, 74.3, 0.03585),
  ('hfa', 'male', 12, 1, 75.7488, 0.036),
  ('hfa', 'male', 13, 1, 76.8825, 0.03613),
  ('hfa', 'male', 14, 1, 78.0163, 0.03627),
  ('hfa', 'male', 15, 1, 79.15, 0.0364),
  ('hfa', 'male', 16, 1, 80.1833, 0.0365),
  ('hfa', 'male', 17, 1, 81.2167, 0.0366),
  ('hfa', 'male', 18, 1, 82.25, 0.0367),
  ('hfa', 'male', 19, 1, 83.1333, 0.03678),
  ('hfa', 'male', 20, 1, 84.0167, 0.03687),
  ('hfa', 'male', 21, 1, 84.9, 0.03695),
  ('hfa', 'male', 22, 1, 85.6254, 0.03703),
  ('hfa', 'male', 23, 1, 86.3507, 0.03712),
  ('hfa', 'male', 24, 1, 87.0761, 0.0372),
  ('wfa', 'female', 0, 0.3809, 3.2322, 0.14171),
  ('wfa', 'female', 1, 0.3809, 4.1873, 0.13724),
  ('wfa', 'female', 2, 0.3809, 5.128, 0.1308),
  ('wfa', 'female', 3, 0.3809, 5.8458, 0.12619),
  ('wfa', 'female', 4, 0.3809, 6.423, 0.1248),
  ('wfa', 'female', 5, 0.3809, 6.864, 0.1243),
  ('wfa', 'female', 6, 0.3809, 7.2115, 0.12402),
  ('wfa', 'female', 7, 0.3809, 7.54, 0.1238),
  ('wfa', 'female', 8, 0.3809, 7.84, 0.1236),
  ('wfa', 'female', 9, 0.3809, 8.12, 0.1234),
  ('wfa', 'female', 10, 0.3809, 8.38, 0.1232),
  ('wfa', 'female', 11, 0.3809, 8.62, 0.12295),
  ('wfa', 'female', 12, 0.3809, 8.9481, 0.12274),
  ('wfa', 'female', 13, 0.3809, 9.2054, 0.12233),
  ('wfa', 'female', 14, 0.3809, 9.4627, 0.12191),
  ('wfa', 'female', 15, 0.3809, 9.72, 0.1215),
  ('wfa', 'female', 16, 0.3809, 9.9467, 0.12107),
  ('wfa', 'female', 17, 0.3809, 10.1733, 0.12063),
  ('wfa', 'female', 18, 0.3809, 10.4, 0.1202),
  ('wfa', 'female', 19, 0.3809, 10.5933, 0.11977),
  ('wfa', 'female', 20, 0.3809, 10.7867, 0.11933),
  ('wfa', 'female', 21, 0.3809, 10.98, 0.1189),
  ('wfa', 'female', 22, 0.3809, 11.1486, 0.11851),
  ('wfa', 'female', 23, 0.3809, 11.3172, 0.11813),
  ('wfa', 'female', 24, 0.3809, 11.4858, 0.11774),
  ('hfa', 'female', 0, 1, 49.1477, 0.0379),
  ('hfa', 'female', 1, 1, 53.6872, 0.03498),
  ('hfa', 'female', 2, 1, 57.067, 0.0344),
  ('hfa', 'female', 3, 1, 59.8029, 0.03402),
  ('hfa', 'female', 4, 1, 62.09, 0.03415),
  ('hfa', 'female', 5, 1, 64.05, 0.0343),
  ('hfa', 'female', 6, 1, 65.7311, 0.03443),
  ('hfa', 'female', 7, 1, 67.2, 0.0346),
  ('hfa', 'female', 8, 1, 68.55, 0.0348),
  ('hfa', 'female', 9, 1, 69.8, 0.035),
  ('hfa', 'female', 10, 1, 71, 0.0352),
  ('hfa', 'female', 11, 1, 72.15, 0.0354),
  ('hfa', 'female', 12, 1, 74.0248, 0.03564),
  ('hfa', 'female', 13, 1, 75.1165, 0.03576),
  ('hfa', 'female', 14, 1, 76.2083, 0.03588),
  ('hfa', 'female', 15, 1, 77.3, 0.036),
  ('hfa', 'female', 16, 1, 78.2833, 0.0361),
  ('hfa', 'female', 17, 1, 79.2667, 0.0362),
  ('hfa', 'female', 18, 1, 80.25, 0.0363),
  ('hfa', 'female', 19, 1, 81.2, 0.03638),
  ('hfa', 'female', 20, 1, 82.15, 0.03647),
  ('hfa', 'female', 21, 1, 83.1, 0.03655),
  ('hfa', 'female', 22, 1, 83.977, 0.03665),
  ('hfa', 'female', 23, 1, 84.8541, 0.03674),
  ('hfa', 'female', 24, 1, 85.7311, 0.03684)
on conflict (indicator, gender, age_months) do nothing;

-- -----------------------------------------------------------------------------
-- 2) 10 Resep MBG (Makanan Bergizi Gratis) — kalori disesuaikan porsi balita
-- Target kasar: snack 150–250 kcal | meal 280–450 kcal | protein tinggi prioritas stunting
-- -----------------------------------------------------------------------------

insert into public.recipes (
  slug, title, category, age_min_months, age_max_months,
  calories, protein_g, fat_g, carbs_g,
  ingredients, instructions, is_high_protein, is_mbg_eligible, priority
)
values
(
  'bubur-ayam-kampung-mbg',
  'Bubur Ayam Kampung MBG',
  'breakfast',
  6, 36,
  320, 14, 8, 42,
  array['50g beras', '40g dada ayam kampung', '1 sdm wortel parut', '1 sdm bayam cincang', '400ml kaldu ayam rendah garam'],
  array['Rebus beras dengan kaldu hingga lembut', 'Masukkan ayam cincang, masak hingga matang', 'Tambahkan sayur, aduk 3 menit', 'Sajikan hangat (tekstur sesuai usia)'],
  true, true, 10
),
(
  'nasi-tim-ikan-salmon',
  'Nasi Tim Ikan Salmon & Brokoli',
  'lunch',
  8, 48,
  380, 16, 12, 45,
  array['60g beras', '40g salmon tanpa duri', '30g brokoli', '1 sdt minyak zaitun', 'air secukupnya'],
  array['Kukus beras hingga matang', 'Kukus salmon & brokoli 8–10 menit', 'Hancurkan/haluskan sesuai usia', 'Campur dengan minyak zaitun'],
  true, true, 9
),
(
  'sup-telur-tahu-wortel',
  'Sup Telur Tahu Wortel',
  'dinner',
  7, 36,
  290, 13, 10, 28,
  array['1 butir telur', '50g tahu putih', '30g wortel', '300ml kaldu sayur', '1 sdm daun bawang'],
  array['Rebus kaldu', 'Masukkan tahu & wortel dadu kecil', 'Kocok telur, tuang perlahan sambil diaduk', 'Masak hingga matang, sajikan hangat'],
  true, true, 8
),
(
  'smoothie-pisang-yogurt',
  'Smoothie Pisang Yogurt Fortifikasi',
  'snack',
  12, 60,
  210, 8, 5, 32,
  array['1 pisang matang', '100ml yogurt plain', '1 sdm oatmeal halus', '50ml susu full cream'],
  array['Blender semua bahan hingga halus', 'Sajikan segera (dingin/suhu ruang)'],
  false, true, 6
),
(
  'mie-kuah-ayam-sayur',
  'Mie Kuah Ayam Sayur MBG',
  'lunch',
  12, 60,
  410, 15, 11, 52,
  array['50g mie basah', '40g ayam giling', '20g sawi', '20g wortel', '300ml kaldu ayam'],
  array['Tumis ayam hingga matang', 'Tambahkan kaldu & sayur', 'Masukkan mie, masak 3 menit', 'Sajikan hangat'],
  true, true, 8
),
(
  'puding-susu-kurma',
  'Puding Susu Kurma Energi',
  'snack',
  12, 60,
  180, 6, 4, 28,
  array['150ml susu', '2 butir kurma tanpa biji', '1 sdm agar-agar bubuk', '1 sdt madu (opsional >12 bln)'],
  array['Haluskan kurma dengan susu', 'Didihkan, masukkan agar-agar', 'Tuangkan ke cetakan, dinginkan'],
  false, true, 5
),
(
  'omelet-sayur-keju',
  'Omelet Sayur Keju Mini',
  'breakfast',
  9, 48,
  300, 15, 18, 8,
  array['2 butir telur', '20g keju parut', '20g bayam', '10g tomat', '1 sdt minyak'],
  array['Kocok telur', 'Tumis sayur singkat', 'Tuang telur, taburi keju', 'Lipat & sajikan'],
  true, true, 9
),
(
  'bubur-kacang-hijau-santan',
  'Bubur Kacang Hijau Santan Encer',
  'snack',
  10, 60,
  240, 9, 7, 35,
  array['40g kacang hijau', '200ml air', '50ml santan encer', '1 sdm gula aren (sedikit)'],
  array['Rebus kacang hijau hingga empuk', 'Haluskan sebagian untuk tekstur lembut', 'Tambahkan santan encer, masak 2 menit'],
  false, true, 6
),
(
  'tumis-tempe-buncis-nasi',
  'Nasi + Tempe Tumis Buncis',
  'dinner',
  12, 60,
  420, 17, 12, 55,
  array['80g nasi putih', '50g tempe', '30g buncis', '1 siung bawang putih', '1 sdt kecap manis'],
  array['Tumis bawang & tempe', 'Masukkan buncis, masak matang', 'Sajikan dengan nasi hangat'],
  true, true, 9
),
(
  'puree-alpukat-pisang',
  'Puree Alpukat Pisang MPASI',
  'snack',
  6, 18,
  160, 3, 9, 18,
  array['1/2 alpukat matang', '1/2 pisang', '1–2 sdm ASI/sufor (opsional)'],
  array['Haluskan alpukat & pisang', 'Tambahkan cairan jika perlu', 'Sajikan segera'],
  false, true, 7
)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 3) Verifikasi cepat
-- -----------------------------------------------------------------------------
-- select indicator, gender, count(*) from who_standards group by 1,2 order by 1,2;
-- select category, count(*), round(avg(calories)) as avg_kcal from recipes group by 1;

comment on table public.who_standards is 'WHO Child Growth Standards LMS parameters for Z-score calculation';
comment on table public.recipes is 'MBG recipe catalog for nutrition recommendations';
