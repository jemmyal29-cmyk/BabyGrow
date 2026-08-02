-- =============================================================================
-- Verifikasi (aman tanpa asumsi kolom email selalu ada di SELECT mentah)
-- =============================================================================

select 'profiles' as t, count(*)::bigint as n from public.profiles
union all select 'children', count(*) from public.children
union all select 'measurements', count(*) from public.measurements
union all select 'who_standards', count(*) from public.who_standards
union all select 'recipes', count(*) from public.recipes;

-- Kolom aktual profiles
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- User + role (email dari Auth)
select
  p.id,
  u.email as auth_email,
  p.full_name,
  p.role::text as role_raw,
  p.role_app
from public.profiles p
left join auth.users u on u.id = p.id
order by u.created_at desc nulls last;
