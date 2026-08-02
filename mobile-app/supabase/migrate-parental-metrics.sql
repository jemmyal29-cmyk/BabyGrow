-- =============================================================================
-- MIGRATE: data orang tua (tinggi/berat/golongan darah) → tabel children
-- Sebelumnya hanya disimpan di HP (AsyncStorage). Sekarang ikut cloud.
--
-- Jalankan di SQL Editor → New query → Run
-- Lalu isi ulang / edit anak di app agar data ikut tersimpan ke cloud
-- =============================================================================

alter table public.children
  add column if not exists mother_height_cm numeric,
  add column if not exists father_height_cm numeric,
  add column if not exists mother_weight_kg numeric,
  add column if not exists father_weight_kg numeric,
  add column if not exists mother_blood text,
  add column if not exists father_blood text,
  add column if not exists child_blood text;

-- Batasi nilai golongan darah (kosong / null tetap boleh)
do $$
begin
  alter table public.children
    drop constraint if exists children_mother_blood_check;
  alter table public.children
    drop constraint if exists children_father_blood_check;
  alter table public.children
    drop constraint if exists children_child_blood_check;

  alter table public.children
    add constraint children_mother_blood_check
      check (mother_blood is null or mother_blood in ('A', 'B', 'AB', 'O'));
  alter table public.children
    add constraint children_father_blood_check
      check (father_blood is null or father_blood in ('A', 'B', 'AB', 'O'));
  alter table public.children
    add constraint children_child_blood_check
      check (child_blood is null or child_blood in ('A', 'B', 'AB', 'O'));
end $$;

-- Verifikasi kolom
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'children'
  and column_name in (
    'mother_height_cm', 'father_height_cm',
    'mother_weight_kg', 'father_weight_kg',
    'mother_blood', 'father_blood', 'child_blood'
  )
order by column_name;

-- Refresh schema cache PostgREST (penting setelah ALTER)
notify pgrst, 'reload schema';
