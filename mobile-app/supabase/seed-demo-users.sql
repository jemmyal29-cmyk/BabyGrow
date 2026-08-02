-- =============================================================================
-- BabyGrow — Buat 2 akun demo (USER + PETUGAS/ADMIN)
-- Kompatibel dengan profiles.role bertipe ENUM user_role + kolom role_app
--
-- Login app:
--   User (orang tua):  parent@babygrow.local  /  Parent1234
--   Petugas (admin):   admin@babygrow.local   /  Admin1234
--
-- Jalankan di SQL Editor (New query). Aman dijalankan ulang.
-- =============================================================================

create extension if not exists pgcrypto;

-- Pastikan kolom role_app ada (app membaca ini)
alter table public.profiles add column if not exists role_app text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists puskesmas text;
alter table public.profiles add column if not exists district text;
alter table public.profiles add column if not exists city text;

-- ---------------------------------------------------------------------------
-- Fix trigger: jangan insert TEXT mentah ke enum user_role
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_role_app  text;
  v_enum_lbl  text;
  v_role_udt  text;
  v_has_role_app boolean;
begin
  v_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  v_role_app := upper(coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'ROLE_USER'));
  if v_role_app in ('ADMIN', 'ROLE_ADMIN', 'PETUGAS', 'KADER') then
    v_role_app := 'ROLE_ADMIN';
  else
    v_role_app := 'ROLE_USER';
  end if;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role_app'
  ) into v_has_role_app;

  select c.udt_name into v_role_udt
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'profiles' and c.column_name = 'role';

  -- Pilih label enum yang cocok (parent/admin/dll.)
  if v_role_udt = 'user_role' then
    if v_role_app = 'ROLE_ADMIN' then
      select e.enumlabel into v_enum_lbl
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'user_role'
        and lower(e.enumlabel) in ('admin', 'role_admin', 'petugas', 'kader')
      order by e.enumsortorder
      limit 1;
    else
      select e.enumlabel into v_enum_lbl
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'user_role'
        and lower(e.enumlabel) in ('parent', 'user', 'role_user', 'orang_tua')
      order by e.enumsortorder
      limit 1;
    end if;

    if v_enum_lbl is null then
      select e.enumlabel into v_enum_lbl
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'user_role'
      order by e.enumsortorder
      limit 1;
    end if;

    insert into public.profiles (id, email, full_name, role)
    values (new.id, new.email, v_full_name, v_enum_lbl::public.user_role)
    on conflict (id) do nothing;
  else
    -- role bertipe TEXT
    insert into public.profiles (id, email, full_name, role)
    values (new.id, new.email, v_full_name, v_role_app)
    on conflict (id) do nothing;
  end if;

  if v_has_role_app then
    update public.profiles
    set
      role_app = v_role_app,
      email = coalesce(nullif(email, ''), new.email),
      full_name = coalesce(nullif(full_name, ''), v_full_name)
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: map ROLE_* → label enum user_role yang ada di DB
-- ---------------------------------------------------------------------------
create or replace function public._babygrow_map_user_role(p_role_app text)
returns text
language plpgsql
stable
as $$
declare
  v_lbl text;
  v_want text := upper(coalesce(p_role_app, 'ROLE_USER'));
begin
  if v_want in ('ADMIN', 'ROLE_ADMIN', 'PETUGAS', 'KADER') then
    select e.enumlabel into v_lbl
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and lower(e.enumlabel) in ('admin', 'role_admin', 'petugas', 'kader')
    order by e.enumsortorder
    limit 1;
  else
    select e.enumlabel into v_lbl
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and lower(e.enumlabel) in ('parent', 'user', 'role_user', 'orang_tua')
    order by e.enumsortorder
    limit 1;
  end if;

  if v_lbl is null then
    select e.enumlabel into v_lbl
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
    order by e.enumsortorder
    limit 1;
  end if;

  return v_lbl;
end;
$$;

do $$
declare
  -- ========== CONFIG ==========
  v_user_email     text := 'parent@babygrow.local';
  v_user_password  text := 'Parent1234';
  v_user_name      text := 'Orang Tua Demo';

  v_admin_email    text := 'admin@babygrow.local';
  v_admin_password text := 'Admin1234';
  v_admin_name     text := 'Petugas Demo';
  -- ===========================

  v_instance_id uuid;
  v_user_id     uuid;
  v_admin_id    uuid;
  v_role_udt    text;
  v_enum_user   text;
  v_enum_admin  text;
begin
  select id into v_instance_id from auth.instances limit 1;
  if v_instance_id is null then
    v_instance_id := '00000000-0000-0000-0000-000000000000';
  end if;

  select c.udt_name into v_role_udt
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'profiles' and c.column_name = 'role';

  v_enum_user  := public._babygrow_map_user_role('ROLE_USER');
  v_enum_admin := public._babygrow_map_user_role('ROLE_ADMIN');

  -- ==========================================================================
  -- 1) USER
  -- ==========================================================================
  select id into v_user_id from auth.users where lower(email) = lower(v_user_email);

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      v_instance_id, v_user_id, 'authenticated', 'authenticated',
      v_user_email, crypt(v_user_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_user_name, 'role', 'ROLE_USER'),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_user_email, 'email_verified', true),
      'email', v_user_id::text, now(), now(), now()
    );
  end if;

  -- Sinkronkan profile (trigger mungkin sudah isi)
  if v_role_udt = 'user_role' then
    insert into public.profiles (id, email, full_name, role, role_app)
    values (v_user_id, v_user_email, v_user_name, v_enum_user::public.user_role, 'ROLE_USER')
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
      role_app = 'ROLE_USER';
  else
    insert into public.profiles (id, email, full_name, role, role_app)
    values (v_user_id, v_user_email, v_user_name, 'ROLE_USER', 'ROLE_USER')
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
      role = 'ROLE_USER',
      role_app = 'ROLE_USER';
  end if;

  -- ==========================================================================
  -- 2) PETUGAS / ADMIN
  -- ==========================================================================
  select id into v_admin_id from auth.users where lower(email) = lower(v_admin_email);

  if v_admin_id is null then
    v_admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      v_instance_id, v_admin_id, 'authenticated', 'authenticated',
      v_admin_email, crypt(v_admin_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_admin_name, 'role', 'ROLE_ADMIN'),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_admin_id,
      jsonb_build_object('sub', v_admin_id::text, 'email', v_admin_email, 'email_verified', true),
      'email', v_admin_id::text, now(), now(), now()
    );
  end if;

  if v_role_udt = 'user_role' then
    insert into public.profiles (id, email, full_name, role, role_app, puskesmas, district, city)
    values (
      v_admin_id, v_admin_email, v_admin_name,
      v_enum_admin::public.user_role, 'ROLE_ADMIN',
      'Puskesmas Demo', 'Demo', 'Jakarta'
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
      role = excluded.role,
      role_app = 'ROLE_ADMIN',
      puskesmas = coalesce(public.profiles.puskesmas, excluded.puskesmas),
      district = coalesce(public.profiles.district, excluded.district),
      city = coalesce(public.profiles.city, excluded.city);
  else
    insert into public.profiles (id, email, full_name, role, role_app, puskesmas, district, city)
    values (
      v_admin_id, v_admin_email, v_admin_name,
      'ROLE_ADMIN', 'ROLE_ADMIN',
      'Puskesmas Demo', 'Demo', 'Jakarta'
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
      role = 'ROLE_ADMIN',
      role_app = 'ROLE_ADMIN',
      puskesmas = coalesce(public.profiles.puskesmas, excluded.puskesmas),
      district = coalesce(public.profiles.district, excluded.district),
      city = coalesce(public.profiles.city, excluded.city);
  end if;

  raise notice 'OK — login: % / %  dan  % / %',
    v_user_email, v_user_password, v_admin_email, v_admin_password;
end $$;

-- Verifikasi
select
  u.email as auth_email,
  p.full_name,
  p.role::text as role_enum,
  p.role_app,
  p.puskesmas,
  u.email_confirmed_at is not null as email_confirmed
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) in (
  lower('parent@babygrow.local'),
  lower('admin@babygrow.local')
)
order by u.email;
