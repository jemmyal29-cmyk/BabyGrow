-- =============================================================================
-- FIX RLS: admin dicek via fungsi security definer (hindari infinite recursion)
-- Jalankan SETELAH migrate-profiles.sql sukses
-- =============================================================================

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
          'admin', 'role_admin', 'petugas', 'kader'
        )
      )
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());

drop policy if exists "Admins manage all children" on public.children;
create policy "Admins manage all children"
  on public.children for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage all measurements" on public.measurements;
create policy "Admins manage all measurements"
  on public.measurements for all
  using (public.is_admin())
  with check (public.is_admin());
