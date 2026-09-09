-- =============================================================================
-- RUNR Platform — complete Supabase schema (idempotent)
-- =============================================================================
-- Safe to re-run in Supabase → SQL Editor whenever the app schema changes.
-- Updates tables, policies, triggers, helper functions, and test accounts.
--
-- Requires: Supabase project with Email auth enabled (Authentication → Providers).
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role text not null default 'customer'
    check (role in ('customer', 'runr', 'business', 'staff')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep columns in sync when re-running after manual edits / older DBs
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Staff can read all profiles" on public.profiles;
create policy "Staff can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'staff'
    )
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Triggers & functions
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        role = excluded.role,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Test account helper (idempotent — replaces same fixed user IDs)
-- ---------------------------------------------------------------------------
create or replace function public.create_runr_test_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_role text,
  p_name text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if p_role not in ('customer', 'runr', 'business', 'staff') then
    raise exception 'Invalid role: %', p_role;
  end if;

  delete from auth.identities where user_id = p_id;
  delete from public.profiles where id = p_id;
  delete from auth.users where id = p_id;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    p_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email'],
      'role', p_role
    ),
    jsonb_build_object(
      'name', p_name,
      'role', p_role
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    p_id,
    p_id::text,
    jsonb_build_object(
      'sub', p_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, name, role)
  values (p_id, p_email, p_name, p_role)
  on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        role = excluded.role,
        updated_at = now();
end;
$$;

-- ---------------------------------------------------------------------------
-- Test accounts — password for all: RunrTest2026!
-- | Email                      | Role     | App / portal      |
-- | porter@test.runr.com       | customer | PORTER            |
-- | runr@test.runr.com         | runr     | RUNR              |
-- | vendr@test.runr.com        | business | VENDR             |
-- | staff@runr.com             | staff    | Staff portal      |
-- | Markkisstickz96@gmail.com  | staff    | Markeith (personal)|
-- | markeith@runr.com          | staff    | Markeith (company) |
-- | Immanuelcurry@gmail.com    | staff    | Immanuel (personal)|
-- | immanuel@runr.com          | staff    | Immanuel (company) |
-- ---------------------------------------------------------------------------
select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000001',
  'porter@test.runr.com',
  'RunrTest2026!',
  'customer',
  'PORTER Tester'
);

select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000002',
  'runr@test.runr.com',
  'RunrTest2026!',
  'runr',
  'RUNR Tester'
);

select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000003',
  'vendr@test.runr.com',
  'RunrTest2026!',
  'business',
  'VENDR Tester'
);

select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000004',
  'staff@runr.com',
  'RunrTest2026!',
  'staff',
  'Staff Tester'
);

-- Founders (staff portal)
select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000005',
  'Markkisstickz96@gmail.com',
  'RunrTest2026!',
  'staff',
  'Markeith White'
);

select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000006',
  'markeith@runr.com',
  'RunrTest2026!',
  'staff',
  'Markeith White'
);

select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000007',
  'Immanuelcurry@gmail.com',
  'RunrTest2026!',
  'staff',
  'Immanuel Curry'
);

select public.create_runr_test_user(
  'b1000000-0000-4000-8000-000000000008',
  'immanuel@runr.com',
  'RunrTest2026!',
  'staff',
  'Immanuel Curry'
);

commit;
