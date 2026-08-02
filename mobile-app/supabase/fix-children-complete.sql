-- =============================================================================
-- ONE-SHOT: perbaiki simpan anak + kolom orang tua + refresh schema
-- Supabase → SQL Editor → New query → Run SEMUA
-- Lalu di app: logout → login → coba Simpan lagi
-- =============================================================================

-- A) Pastikan tabel children ada
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  date_of_birth date not null,
  birth_weight numeric,
  birth_height numeric,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- B) Kolom tambahan (aman diulang) — termasuk date_of_birth!
alter table public.children add column if not exists date_of_birth date;
alter table public.children add column if not exists birth_weight numeric;
alter table public.children add column if not exists birth_height numeric;
alter table public.children add column if not exists photo_url text;
alter table public.children add column if not exists created_at timestamptz default now();
alter table public.children add column if not exists updated_at timestamptz default now();
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

-- Salin dari nama kolom lama → date_of_birth
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='birth_date') then
    update public.children set date_of_birth = birth_date::date where date_of_birth is null and birth_date is not null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='dob') then
    update public.children set date_of_birth = dob::date where date_of_birth is null and dob is not null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='tanggal_lahir') then
    update public.children set date_of_birth = tanggal_lahir::date where date_of_birth is null and tanggal_lahir is not null;
  end if;
end $$;

update public.children
set date_of_birth = coalesce(date_of_birth, '2020-01-01'::date)
where date_of_birth is null;


-- C) Profil untuk semua user Auth yang belum punya (FK parent_id)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role_app text;

insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, u.id::text),
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    split_part(coalesce(u.email, 'user'), '@', 1)
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

update public.profiles
set role_app = coalesce(nullif(role_app, ''), 'ROLE_USER')
where role_app is null or role_app = '';

-- D) is_admin + RLS children
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        coalesce(p.role_app, '') in ('ROLE_ADMIN', 'admin')
        or lower(coalesce(p.role::text, '')) in (
          'admin', 'role_admin', 'petugas', 'kader'
        )
      )
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

alter table public.children enable row level security;

drop policy if exists "Parents manage own children" on public.children;
drop policy if exists "Admins manage all children" on public.children;

create policy "Parents manage own children"
  on public.children for all
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "Admins manage all children"
  on public.children for all
  using (public.is_admin())
  with check (public.is_admin());

-- E) Izinkan user insert profil sendiri (jika trigger signup gagal)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- F) Refresh PostgREST schema cache (WAJIB setelah ALTER)
notify pgrst, 'reload schema';

-- G) Cek hasil
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
order by ordinal_position;

select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
  ) as missing_profile;
