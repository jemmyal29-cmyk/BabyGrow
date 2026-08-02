-- =============================================================================
-- MIGRATE profiles → skema BabyGrow app (AMAN untuk enum user_role)
-- Jalankan SEKALI di SQL Editor (New query). Harus sukses penuh.
-- =============================================================================

-- 1) Kolom yang dibutuhkan app (skip jika sudah ada)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists puskesmas text;
alter table public.profiles add column if not exists district text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- 2) Kolom role_app (TEXT) — jangan pakai trim() pada enum user_role lama
alter table public.profiles add column if not exists role_app text;

-- 3) Isi email + nama dari Auth
update public.profiles p
set
  email = coalesce(nullif(p.email, ''), u.email),
  full_name = coalesce(
    nullif(p.full_name, ''),
    split_part(coalesce(u.email, 'user'), '@', 1)
  )
from auth.users u
where p.id = u.id;

-- 4) Map role lama (enum/text apa pun) → role_app
--    Sesuaikan mapping jika enum Anda beda (parent/kader/admin, dll.)
update public.profiles p
set role_app = case
  when p.role_app in ('ROLE_USER', 'ROLE_ADMIN') then p.role_app
  when lower(coalesce(p.role::text, '')) in ('role_admin', 'admin', 'petugas', 'kader')
    then 'ROLE_ADMIN'
  else 'ROLE_USER'
end;

-- 5) Jika kolom `role` bertipe TEXT (bukan enum), samakan juga
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and data_type in ('text', 'character varying')
  ) then
    update public.profiles
    set role = role_app
    where role_app is not null;
  end if;
end $$;

-- 6) Lihat hasil + tipe kolom
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

select
  p.id,
  p.email,
  u.email as auth_email,
  p.full_name,
  p.role::text as role_raw,
  p.role_app,
  p.puskesmas
from public.profiles p
left join auth.users u on u.id = p.id;
