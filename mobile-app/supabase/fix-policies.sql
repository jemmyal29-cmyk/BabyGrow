-- =============================================================================
-- BabyGrow — FIX: drop semua RLS policy yang bentrok (jalankan SEBELUM schema)
-- Paste ini dulu di Supabase SQL Editor → Run
-- =============================================================================

-- profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- children
drop policy if exists "Parents manage own children" on public.children;
drop policy if exists "Admins manage all children" on public.children;

-- measurements
drop policy if exists "Parents manage measurements of own children" on public.measurements;
drop policy if exists "Admins manage all measurements" on public.measurements;
