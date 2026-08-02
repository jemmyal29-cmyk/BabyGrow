-- =============================================================================
-- DIAGNOSA 400 POST /children
-- User auth contoh: d1f34ddc-238b-4647-98c9-c9b9a510741d
-- Jalankan di SQL Editor, kirim hasilnya jika masih gagal
-- =============================================================================

-- 1) Apakah profil user ada? (FK parent_id)
select
  u.id,
  u.email,
  p.id as profile_id,
  p.role::text,
  p.role_app,
  case when p.id is null then 'MISSING ← penyebab FK 400/409' else 'OK' end as status
from auth.users u
left join public.profiles p on p.id = u.id
where u.id = 'd1f34ddc-238b-4647-98c9-c9b9a510741d';

-- 2) Buat profil jika hilang
insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, u.id::text),
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    split_part(coalesce(u.email, 'user'), '@', 1)
  )
from auth.users u
where u.id = 'd1f34ddc-238b-4647-98c9-c9b9a510741d'
  and not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- 3) Kolom children (termasuk orang tua)
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
order by ordinal_position;

-- 4) Pastikan kolom orang tua ada
alter table public.children
  add column if not exists mother_height_cm numeric,
  add column if not exists father_height_cm numeric,
  add column if not exists mother_weight_kg numeric,
  add column if not exists father_weight_kg numeric,
  add column if not exists mother_blood text,
  add column if not exists father_blood text,
  add column if not exists child_blood text;

-- 5) Policy INSERT children
select polname, cmd, qual::text, with_check::text
from pg_policies
where schemaname = 'public' and tablename = 'children';

-- 6) NOTIFY PostgREST agar schema cache refresh
notify pgrst, 'reload schema';
