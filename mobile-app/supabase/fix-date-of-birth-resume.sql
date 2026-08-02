-- =============================================================================
-- LANJUTAN (setelah error enum gender_type)
-- Jalankan file ini saja — New query → Run
-- =============================================================================

-- A) Lihat nilai enum gender yang dipakai project Anda
select e.enumlabel
from pg_type t
join pg_enum e on e.enumtypid = t.oid
where t.typname = 'gender_type'
order by e.enumsortorder;

-- B) Tambah label yang dipakai app (aman jika sudah ada)
do $$
begin
  if exists (select 1 from pg_type where typname = 'gender_type') then
    begin
      alter type gender_type add value if not exists 'male';
    exception when others then
      raise notice 'add male: %', SQLERRM;
    end;
    begin
      alter type gender_type add value if not exists 'female';
    exception when others then
      raise notice 'add female: %', SQLERRM;
    end;
  end if;
end $$;

-- C) Pastikan date_of_birth ada
alter table public.children add column if not exists date_of_birth date;

update public.children
set date_of_birth = coalesce(date_of_birth, '2020-01-01'::date)
where date_of_birth is null;

-- D) Kolom lain
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

-- E) Profil hilang
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role_app text;

insert into public.profiles (id, email, full_name)
select u.id, coalesce(u.email, u.id::text),
  coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,'user'),'@',1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- F) RLS
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

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- G) Refresh schema cache
notify pgrst, 'reload schema';

-- H) Verifikasi
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
  and column_name in ('date_of_birth','gender','parent_id','name','mother_height_cm')
order by column_name;

select e.enumlabel as gender_type_values
from pg_type t
join pg_enum e on e.enumtypid = t.oid
where t.typname = 'gender_type'
order by e.enumsortorder;
