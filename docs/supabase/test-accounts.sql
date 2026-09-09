-- RUNR platform test accounts
-- Run in Supabase → SQL Editor (Dashboard for project gpkfhruggvadwsfygbvh)
--
-- 1. Run docs/supabase/schema.sql first (profiles table + trigger).
-- 2. Run this file.
--
-- All accounts use password: RunrTest2026!
--
-- | Email               | Password      | Role     | App / portal |
-- |---------------------|---------------|----------|--------------|
-- | porter@test.runr.com| RunrTest2026! | customer | PORTER       |
-- | runr@test.runr.com  | RunrTest2026! | runr     | RUNR         |
-- | vendr@test.runr.com | RunrTest2026! | business | VENDR        |
-- | staff@runr.com      | RunrTest2026! | staff    | Staff portal |

create extension if not exists pgcrypto;

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

-- Fixed IDs so re-running this script replaces the same test users.
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

-- Optional cleanup helper (run manually if you want to remove test users):
-- drop function if exists public.create_runr_test_user(uuid, text, text, text, text);
