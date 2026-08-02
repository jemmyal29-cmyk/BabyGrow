-- =============================================================================
-- FIX: gagal menyimpan data anak
-- Gejala app: "Gagal Menyimpan" / RLS / foreign key saat tambah anak
--
-- Penyebab umum:
--   1) User login ada di Auth, tapi BELUM ada baris di public.profiles
--      → parent_id tidak lolos FK ke profiles
--   2) Policy RLS children tidak punya WITH CHECK untuk INSERT
--   3) Policy admin masih recurse / is_admin rusak
--
-- Cara: Supabase → SQL Editor → New query → paste → Run
-- TIDAK perlu upload ulang schema.sql penuh, TIDAK perlu rebuild APK
-- =============================================================================

-- A) Pastikan kolom role_app ada (aman jika sudah ada)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role_app text;

-- B) Buat profil untuk SEMUA user Auth yang belum punya baris profiles
--    (ini penyebab paling sering: FK parent_id → profiles gagal)
do $$
declare
  has_role_app boolean;
  has_role_text boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role_app'
  ) into has_role_app;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'role' and data_type in ('text', 'character varying')
  ) into has_role_text;

  if has_role_text and has_role_app then
    insert into public.profiles (id, email, full_name, role, role_app)
    select
      u.id,
      coalesce(u.email, u.id::text),
      coalesce(
        nullif(u.raw_user_meta_data->>'full_name', ''),
        split_part(coalesce(u.email, 'user'), '@', 1)
      ),
      'ROLE_USER',
      'ROLE_USER'
    from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
    on conflict (id) do nothing;
  elsif has_role_app then
    insert into public.profiles (id, email, full_name, role_app)
    select
      u.id,
      coalesce(u.email, u.id::text),
      coalesce(
        nullif(u.raw_user_meta_data->>'full_name', ''),
        split_part(coalesce(u.email, 'user'), '@', 1)
      ),
      'ROLE_USER'
    from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
    on conflict (id) do nothing;
  else
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
  end if;
end $$;

-- Samakan role_app jika kosong
update public.profiles
set role_app = coalesce(
  nullif(role_app, ''),
  case
    when lower(coalesce(role::text, '')) in ('role_admin', 'admin', 'petugas', 'kader')
      then 'ROLE_ADMIN'
    else 'ROLE_USER'
  end
)
where role_app is null or role_app = '';

-- C) Fungsi is_admin tanpa recursion (aman meski role_app belum diisi semua)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        coalesce(p.role_app, '') in ('ROLE_ADMIN', 'admin')
        or lower(coalesce(p.role::text, '')) in (
          'admin', 'role_admin', 'petugas', 'kader', 'role_admin'
        )
      )
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

  create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  date_of_birth date not null,
  birth_weight numeric,
  birth_height numeric,
  photo_url text,
  mother_height_cm numeric,
  father_height_cm numeric,
  mother_weight_kg numeric,
  father_weight_kg numeric,
  mother_blood text,
  father_blood text,
  child_blood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.children enable row level security;

-- E) Policy children: orang tua boleh INSERT/SELECT/UPDATE/DELETE miliknya
drop policy if exists "Parents manage own children" on public.children;
drop policy if exists "Admins manage all children" on public.children;
drop policy if exists "Parents insert own children" on public.children;
drop policy if exists "Parents select own children" on public.children;
drop policy if exists "Parents update own children" on public.children;
drop policy if exists "Parents delete own children" on public.children;

create policy "Parents manage own children"
  on public.children for all
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "Admins manage all children"
  on public.children for all
  using (public.is_admin())
  with check (public.is_admin());

-- F) Diagnostik — jalankan hasilnya, cek:
--    • setiap email login punya baris profiles
--    • missing_profile = 0
select
  u.email,
  u.id as auth_id,
  p.id as profile_id,
  p.role::text as role_raw,
  p.role_app,
  case when p.id is null then 'MISSING PROFILE ← penyebab FK' else 'OK' end as status
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc
limit 20;

select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from auth.users u
   where not exists (select 1 from public.profiles p where p.id = u.id)
  ) as missing_profile,
  (select count(*) from public.children) as children_count;
