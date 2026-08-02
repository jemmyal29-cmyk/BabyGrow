-- =============================================================================
-- FIX: Could not find the 'date_of_birth' column of 'children'
-- Artinya tabel children di project ANDA pakai nama kolom LAIN (atau belum ada).
--
-- Jalankan di SQL Editor → New query → Run
-- =============================================================================

-- 1) Lihat kolom yang ADA sekarang (wajib dicek)
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
order by ordinal_position;

-- 2) Pastikan tabel ada
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  gender text not null,
  date_of_birth date not null default '2020-01-01',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Tambah date_of_birth jika belum ada
alter table public.children
  add column if not exists date_of_birth date;

-- 4) Salin dari nama kolom lama yang umum → date_of_birth
do $$
begin
  -- birth_date
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='children' and column_name='birth_date'
  ) then
    execute $q$
      update public.children
      set date_of_birth = birth_date::date
      where date_of_birth is null and birth_date is not null
    $q$;
  end if;

  -- dob
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='children' and column_name='dob'
  ) then
    execute $q$
      update public.children
      set date_of_birth = dob::date
      where date_of_birth is null and dob is not null
    $q$;
  end if;

  -- tanggal_lahir
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='children' and column_name='tanggal_lahir'
  ) then
    execute $q$
      update public.children
      set date_of_birth = tanggal_lahir::date
      where date_of_birth is null and tanggal_lahir is not null
    $q$;
  end if;

  -- birthday
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='children' and column_name='birthday'
  ) then
    execute $q$
      update public.children
      set date_of_birth = birthday::date
      where date_of_birth is null and birthday is not null
    $q$;
  end if;
end $$;

-- 5) Isi default untuk baris yang masih null, lalu NOT NULL
update public.children
set date_of_birth = coalesce(date_of_birth, '2020-01-01'::date)
where date_of_birth is null;

alter table public.children
  alter column date_of_birth set default '2020-01-01';

-- Jadikan NOT NULL jika memungkinkan
do $$
begin
  alter table public.children alter column date_of_birth set not null;
exception when others then
  raise notice 'date_of_birth belum bisa NOT NULL: %', SQLERRM;
end $$;

-- 6) Kolom lain yang app butuhkan
alter table public.children add column if not exists birth_weight numeric;
alter table public.children add column if not exists birth_height numeric;
alter table public.children add column if not exists photo_url text;
alter table public.children add column if not exists mother_height_cm numeric;
alter table public.children add column if not exists father_height_cm numeric;
alter table public.children add column if not exists mother_weight_kg numeric;
alter table public.children add column if not exists father_weight_kg numeric;
alter table public.children add column if not exists mother_blood text;
alter table public.children add column if not exists father_blood text;
alter table public.children add column if not exists child_blood text;
alter table public.children add column if not exists name text;
alter table public.children add column if not exists gender text;
alter table public.children add column if not exists parent_id uuid;
alter table public.children add column if not exists created_at timestamptz default now();
alter table public.children add column if not exists updated_at timestamptz default now();

-- 7) Normalisasi gender — OPSIONAL, jangan gagalkan migrasi
-- (blok lama yang error enum sudah dipindah ke fix-date-of-birth-resume.sql)
select 'skip gender normalize — lanjut ke RLS' as info;

-- 8) RLS + profil (ringkas)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role_app text;

insert into public.profiles (id, email, full_name)
select u.id, coalesce(u.email, u.id::text),
  coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,'user'),'@',1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

alter table public.children enable row level security;

drop policy if exists "Parents manage own children" on public.children;
drop policy if exists "Admins manage all children" on public.children;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        coalesce(p.role_app,'') in ('ROLE_ADMIN','admin')
        or lower(coalesce(p.role::text,'')) in ('admin','role_admin','petugas','kader')
      )
  );
$$;

create policy "Parents manage own children"
  on public.children for all
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "Admins manage all children"
  on public.children for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 9) WAJIB: refresh schema cache PostgREST
notify pgrst, 'reload schema';

-- 10) Verifikasi — date_of_birth HARUS muncul
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
  and column_name in ('id','parent_id','name','gender','date_of_birth','birth_date','dob','tanggal_lahir')
order by column_name;
