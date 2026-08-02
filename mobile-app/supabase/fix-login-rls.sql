-- =============================================================================
-- FIX LOGIN: infinite recursion di RLS profiles
-- Penyebab: policy admin SELECT profiles → query profiles lagi → recurse
-- Solusi: cek admin lewat fungsi SECURITY DEFINER (bypass RLS)
--
-- Jalankan di SQL Editor → New query → Run
-- TIDAK perlu rebuild/deploy APK
-- =============================================================================

-- 1) Helper: apakah user saat ini admin?
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

-- 2) Drop policy lama yang recurse
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Parents manage own children" on public.children;
drop policy if exists "Admins manage all children" on public.children;

drop policy if exists "Parents manage measurements of own children" on public.measurements;
drop policy if exists "Admins manage all measurements" on public.measurements;

-- 3) Policy profiles (tanpa subquery ke profiles di dalam policy profiles)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow self-insert so app can backfill missing profiles (FK parent_id)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4) Children
create policy "Parents manage own children"
  on public.children for all
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "Admins manage all children"
  on public.children for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5) Measurements
create policy "Parents manage measurements of own children"
  on public.measurements for all
  using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );

create policy "Admins manage all measurements"
  on public.measurements for all
  using (public.is_admin())
  with check (public.is_admin());

-- 6) Verifikasi cepat (harus return 1 baris per akun, tanpa error recursion)
--    Jalankan setelah login test di app, atau cek lewat Auth di dashboard.
select
  u.email,
  p.full_name,
  p.role::text as role_enum,
  p.role_app
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) in (
  'parent@babygrow.local',
  'admin@babygrow.local'
)
order by u.email;
