-- =============================================================================
-- RUNR Platform — complete Supabase schema (idempotent)
-- =============================================================================
-- Safe to re-run in Supabase → SQL Editor whenever the app schema changes.
-- Updates tables, policies, triggers, founder accounts, and dev test accounts.
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
  personal_email text,
  company_email text,
  name text,
  role text not null default 'customer'
    check (role in ('customer', 'runr', 'business', 'staff')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists personal_email text;
alter table public.profiles add column if not exists company_email text;
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
  insert into public.profiles (id, email, personal_email, company_email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'personal_email', new.email),
    new.raw_user_meta_data->>'company_email',
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update
    set email = excluded.email,
        personal_email = coalesce(excluded.personal_email, public.profiles.personal_email),
        company_email = coalesce(excluded.company_email, public.profiles.company_email),
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
-- Founder accounts (permanent — one auth user per founder, both emails on profile)
-- Login email = personal Gmail (works before @runr.com mail is configured).
-- Company @runr.com stored on profile; switch auth email in Supabase when ready.
-- ---------------------------------------------------------------------------
create or replace function public.upsert_runr_founder(
  p_id uuid,
  p_name text,
  p_password text,
  p_personal_email text,
  p_company_email text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
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
    p_personal_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email'],
      'role', 'staff'
    ),
    jsonb_build_object(
      'name', p_name,
      'role', 'staff',
      'personal_email', p_personal_email,
      'company_email', p_company_email
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
      'email', p_personal_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, personal_email, company_email, name, role)
  values (p_id, p_personal_email, p_personal_email, p_company_email, p_name, 'staff')
  on conflict (id) do update
    set email = excluded.email,
        personal_email = excluded.personal_email,
        company_email = excluded.company_email,
        name = excluded.name,
        role = excluded.role,
        updated_at = now();
end;
$$;

-- Remove legacy split founder rows (one account per founder now)
delete from auth.identities where user_id in (
  'b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000006',
  'b1000000-0000-4000-8000-000000000007',
  'b1000000-0000-4000-8000-000000000008'
);
delete from public.profiles where id in (
  'b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000006',
  'b1000000-0000-4000-8000-000000000007',
  'b1000000-0000-4000-8000-000000000008'
);
delete from auth.users where id in (
  'b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000006',
  'b1000000-0000-4000-8000-000000000007',
  'b1000000-0000-4000-8000-000000000008'
);

-- Founders — set your own password below before launch (default: RunrTest2026!)
select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000001',
  'Markeith White',
  'RunrTest2026!',
  'Markkisstickz96@gmail.com',
  'markeith@runr.com'
);

select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000002',
  'Immanuel Curry',
  'RunrTest2026!',
  'Immanuelcurry@gmail.com',
  'immanuel@runr.com'
);

-- ---------------------------------------------------------------------------
-- Dev test accounts (optional — remove this block before production launch)
-- Password: RunrTest2026!
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

  insert into public.profiles (id, email, personal_email, company_email, name, role)
  values (p_id, p_email, p_email, null, p_name, p_role)
  on conflict (id) do update
    set email = excluded.email,
        personal_email = excluded.personal_email,
        name = excluded.name,
        role = excluded.role,
        updated_at = now();
end;
$$;

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

commit;
