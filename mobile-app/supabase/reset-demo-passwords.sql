-- =============================================================================
-- Reset password akun demo (password TANPA karakter spesial)
-- Jalankan di Supabase SQL Editor → Run
--
-- Setelah ini login di APK:
--   parent@babygrow.local  /  Parent1234
--   admin@babygrow.local   /  Admin1234
-- =============================================================================

create extension if not exists pgcrypto;

update auth.users
set
  encrypted_password = crypt('Parent1234', gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = lower('parent@babygrow.local');

update auth.users
set
  encrypted_password = crypt('Admin1234', gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = lower('admin@babygrow.local');

-- Verifikasi (harus 2 baris)
select email, email_confirmed_at is not null as confirmed, updated_at
from auth.users
where lower(email) in ('parent@babygrow.local', 'admin@babygrow.local')
order by email;
