-- =============================================================================
-- FORCE FIX: Tombol Simpan Anak gagal
-- Jalankan SEKALI di Supabase → SQL Editor → Run
-- Lalu di app: logout → login → coba Simpan lagi
-- =============================================================================

-- 1) Kolom yang dibutuhkan app
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role_app text;

alter table public.children add column if not exists parent_id uuid;
alter table public.children add column if not exists name text;
alter table public.children add column if not exists full_name text;
alter table public.children add column if not exists gender text;
alter table public.children add column if not exists date_of_birth date;
alter table public.children add column if not exists birth_date date;
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
alter table public.children add column if not exists created_at timestamptz default now();
alter table public.children add column if not exists updated_at timestamptz default now();

-- 2) Enum gender: pastikan male/female ada
do $$
begin
  if exists (select 1 from pg_type where typname = 'gender_type') then
    begin alter type gender_type add value if not exists 'male'; exception when others then null; end;
    begin alter type gender_type add value if not exists 'female'; exception when others then null; end;
  end if;
end $$;

-- Jika gender masih enum lama tanpa male/female, konversi ke text
do $$
declare
  udt text;
begin
  select udt_name into udt
  from information_schema.columns
  where table_schema='public' and table_name='children' and column_name='gender';

  if udt is not null and udt <> 'text' and udt <> 'varchar' then
    begin
      alter table public.children
        alter column gender type text using gender::text;
    exception when others then
      raise notice 'gender cast skipped: %', SQLERRM;
    end;
  end if;
end $$;

-- Drop check lama yang membatasi nilai aneh, pasang check male/female
alter table public.children drop constraint if exists children_gender_check;
alter table public.children
  add constraint children_gender_check
  check (gender is null or gender in ('male', 'female', 'Laki-laki', 'Perempuan'));

-- 3) Sync alias kolom
update public.children set name = coalesce(nullif(name,''), full_name) where (name is null or name='') and full_name is not null;
update public.children set full_name = coalesce(nullif(full_name,''), name) where (full_name is null or full_name='') and name is not null;
update public.children set date_of_birth = coalesce(date_of_birth, birth_date) where date_of_birth is null and birth_date is not null;
update public.children set birth_date = coalesce(birth_date, date_of_birth) where birth_date is null and date_of_birth is not null;

-- 4) Backfill profiles untuk SEMUA auth users (penyebab FK paling sering)
insert into public.profiles (id, email, full_name, role_app)
select
  u.id,
  coalesce(u.email, u.id::text),
  coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,'user'),'@',1)),
  'ROLE_USER'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Jika kolom role (text) ada, isi juga
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name='role' and data_type in ('text','character varying')
  ) then
    update public.profiles set role = coalesce(nullif(role,''), 'ROLE_USER') where role is null or role = '';
  end if;
end $$;

update public.profiles
set role_app = coalesce(nullif(role_app,''), 'ROLE_USER')
where role_app is null or role_app = '';

-- 5) FK parent_id → profiles (skip jika sudah ada / gagal)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'children_parent_id_fkey') then
    begin
      alter table public.children
        add constraint children_parent_id_fkey
        foreign key (parent_id) references public.profiles(id) on delete cascade;
    exception when others then
      raise notice 'FK skip: %', SQLERRM;
    end;
  end if;
end $$;

-- 6) is_admin tanpa recursion
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
        coalesce(p.role_app,'') in ('ROLE_ADMIN','admin')
        or lower(coalesce(p.role::text,'')) in ('admin','role_admin','petugas','kader')
      )
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- 7) RLS profiles + children (WITH CHECK wajib untuk INSERT)
alter table public.profiles enable row level security;
alter table public.children enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());

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

-- 8) Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- 9) Verifikasi
select column_name, data_type, udt_name
from information_schema.columns
where table_schema='public' and table_name='children'
  and column_name in ('name','full_name','date_of_birth','birth_date','gender','parent_id')
order by column_name;

select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
  ) as missing_profile;
