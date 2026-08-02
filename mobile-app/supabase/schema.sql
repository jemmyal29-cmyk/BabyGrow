-- BabyGrow Supabase Schema
-- Jalankan di Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'ROLE_USER' check (role in ('ROLE_USER', 'ROLE_ADMIN')),
  phone text,
  avatar_url text,
  puskesmas text,
  district text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Children
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  date_of_birth date not null,
  birth_weight numeric,
  birth_height numeric,
  photo_url text,
  -- Data orang tua (opsional) — lihat juga migrate-parental-metrics.sql
  mother_height_cm numeric,
  father_height_cm numeric,
  mother_weight_kg numeric,
  father_weight_kg numeric,
  mother_blood text,
  father_blood text,
  child_blood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Measurements
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  height_cm numeric not null,
  weight_kg numeric,
  head_circumference_cm numeric,
  z_score_hfa numeric,
  z_score_wfa numeric,
  z_score_wfh numeric,
  stunting_risk text check (stunting_risk in ('normal', 'at_risk', 'stunted', 'severe')),
  source text not null default 'manual' check (source in ('mqtt', 'ble', 'manual', 'ai_vision')),
  device_id text,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_children_parent on public.children(parent_id);
create index if not exists idx_measurements_child on public.measurements(child_id);
create index if not exists idx_measurements_measured_at on public.measurements(measured_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'ROLE_USER')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.measurements enable row level security;

-- Profiles policies (idempotent: drop then create)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ROLE_ADMIN')
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Children policies
drop policy if exists "Parents manage own children" on public.children;
create policy "Parents manage own children"
  on public.children for all using (auth.uid() = parent_id);

drop policy if exists "Admins manage all children" on public.children;
create policy "Admins manage all children"
  on public.children for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ROLE_ADMIN')
  );

-- Measurements policies
drop policy if exists "Parents manage measurements of own children" on public.measurements;
create policy "Parents manage measurements of own children"
  on public.measurements for all using (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

drop policy if exists "Admins manage all measurements" on public.measurements;
create policy "Admins manage all measurements"
  on public.measurements for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ROLE_ADMIN')
  );
