-- =============================================================================
-- Promote → ROLE_ADMIN (via Auth email — tidak butuh p.email di WHERE)
-- PRASYARAT: migrate-profiles.sql sudah SUKSES
-- Ganti email di baris bawah!
-- =============================================================================

-- A) Pastikan baris profiles ada untuk user Auth (jika trigger belum jalan)
insert into public.profiles (id, email, full_name, role_app)
select
  u.id,
  u.email,
  split_part(u.email, '@', 1),
  'ROLE_USER'
from auth.users u
where lower(u.email) = lower('admin@babygrow.local')
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- B) Promote
update public.profiles p
set
  role_app = 'ROLE_ADMIN',
  email = coalesce(p.email, u.email),
  full_name = coalesce(nullif(p.full_name, ''), 'Petugas / Admin'),
  puskesmas = coalesce(p.puskesmas, 'Puskesmas Demo'),
  district = coalesce(p.district, 'Demo'),
  city = coalesce(p.city, 'Jakarta')
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('admin@babygrow.local');

-- C) Jika kolom `role` bertipe TEXT, update juga (skip otomatis jika enum)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'role' and data_type in ('text', 'character varying')
  ) then
    update public.profiles p
    set role = 'ROLE_ADMIN'
    from auth.users u
    where p.id = u.id
      and lower(u.email) = lower('admin@babygrow.local');
  end if;
end $$;

-- D) Verifikasi
select
  p.id,
  coalesce(p.email, u.email) as email,
  p.full_name,
  p.role::text as role_raw,
  p.role_app,
  p.puskesmas,
  p.city
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('admin@babygrow.local')
   or p.role_app = 'ROLE_ADMIN';
