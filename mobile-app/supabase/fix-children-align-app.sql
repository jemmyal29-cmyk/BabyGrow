-- =============================================================================
-- ALIGN tabel children → cocok dengan app BabyGrow
-- Error terakhir: Could not find the 'name' column of 'children'
--
-- New query → Run SEMUA → cek hasil verifikasi → tunggu 30 detik
-- =============================================================================

-- 0) Lihat struktur SAAT INI (kirim hasil ini jika masih gagal)
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
order by ordinal_position;

-- 1) Pastikan enum gender punya male/female (app mengirim ini)
do $$
begin
  if exists (select 1 from pg_type where typname = 'gender_type') then
    begin
      alter type gender_type add value if not exists 'male';
    exception when others then null;
    end;
    begin
      alter type gender_type add value if not exists 'female';
    exception when others then null;
    end;
  end if;
end $$;

-- 2) Tambah SEMUA kolom yang app butuhkan
alter table public.children add column if not exists parent_id uuid;
alter table public.children add column if not exists name text;
alter table public.children add column if not exists gender text;
alter table public.children add column if not exists date_of_birth date;
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

-- 3) Salin dari alias kolom lama → name / date_of_birth / parent_id
do $$
begin
  -- name ← full_name / child_name / nama / nama_anak / nama_lengkap
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='full_name') then
    update public.children set name = coalesce(nullif(name,''), full_name) where name is null or name = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='child_name') then
    update public.children set name = coalesce(nullif(name,''), child_name) where name is null or name = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='nama') then
    update public.children set name = coalesce(nullif(name,''), nama) where name is null or name = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='nama_anak') then
    update public.children set name = coalesce(nullif(name,''), nama_anak) where name is null or name = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='nama_lengkap') then
    update public.children set name = coalesce(nullif(name,''), nama_lengkap) where name is null or name = '';
  end if;

  -- date_of_birth ← birth_date / dob / tanggal_lahir / birthday
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='birth_date') then
    update public.children set date_of_birth = coalesce(date_of_birth, birth_date::date);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='dob') then
    update public.children set date_of_birth = coalesce(date_of_birth, dob::date);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='tanggal_lahir') then
    update public.children set date_of_birth = coalesce(date_of_birth, tanggal_lahir::date);
  end if;

  -- parent_id ← user_id / profile_id / orangtua_id / father_id (kurang ideal) / created_by
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='user_id') then
    update public.children set parent_id = coalesce(parent_id, user_id);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='profile_id') then
    update public.children set parent_id = coalesce(parent_id, profile_id);
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='orangtua_id') then
    update public.children set parent_id = coalesce(parent_id, orangtua_id);
  end if;
end $$;

update public.children set name = coalesce(nullif(name,''), 'Anak') where name is null or name = '';
update public.children set date_of_birth = coalesce(date_of_birth, '2020-01-01'::date) where date_of_birth is null;

-- 4) FK parent_id → profiles (skip jika gagal)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'children_parent_id_fkey'
  ) then
    begin
      alter table public.children
        add constraint children_parent_id_fkey
        foreign key (parent_id) references public.profiles(id) on delete cascade;
    exception when others then
      raise notice 'Skip FK parent_id: %', SQLERRM;
    end;
  end if;
end $$;

-- 5) Profil + RLS
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role_app text;

insert into public.profiles (id, email, full_name)
select u.id, coalesce(u.email, u.id::text),
  coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,'user'),'@',1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

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

-- 6) Pastikan exposed ke API (PostgREST)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select on public.children to anon;

-- 7) Reload schema BERKALI-KALI (kadang sekali tidak cukup)
notify pgrst, 'reload schema';
notify pgrst, 'reload config';

-- 8) VERIFIKASI — keempat ini HARUS ada
select
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='name') as has_name,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='date_of_birth') as has_dob,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='gender') as has_gender,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='children' and column_name='parent_id') as has_parent_id;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'children'
order by ordinal_position;
