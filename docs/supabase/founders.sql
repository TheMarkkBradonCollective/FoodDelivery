-- =============================================================================
-- Add Porter founders (run after complete-schema.sql)
-- =============================================================================
-- Staff is already established by complete-schema.sql: role 'staff', is_staff(),
-- Porter Command policies, and staff chat. This snippet only adds the two
-- founders as staff accounts (is_founder = true).
--
-- Sign in at https://food-deliverytest.vercel.app/login/ with the personal
-- Gmail and password RunrTest2026! Use Porter Command Portal (not App Users).
-- Change the password in Supabase → Authentication after the first sign-in.
-- =============================================================================

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists personal_email text;
alter table public.profiles add column if not exists company_email text;
alter table public.profiles add column if not exists is_founder boolean not null default false;

alter table public.profiles drop constraint if exists profiles_founder_is_staff;
alter table public.profiles add constraint profiles_founder_is_staff
  check (not is_founder or role = 'staff');

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
    lower(p_personal_email),
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
      'is_founder', 'true',
      'personal_email', lower(p_personal_email),
      'company_email', lower(p_company_email)
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
      'email', lower(p_personal_email),
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, personal_email, company_email, name, role, is_founder)
  values (
    p_id,
    lower(p_personal_email),
    lower(p_personal_email),
    lower(p_company_email),
    p_name,
    'staff',
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        personal_email = excluded.personal_email,
        company_email = excluded.company_email,
        name = excluded.name,
        role = 'staff',
        is_founder = true,
        updated_at = now();
end;
$$;

-- Markeith White — founder, staff
select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000001'::uuid,
  'Markeith White'::text,
  'RunrTest2026!'::text,
  'markkisstickz96@gmail.com'::text,
  'markeith@runr.com'::text
);

-- Emmanuel Cury — founder, staff
select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000002'::uuid,
  'Emmanuel Cury'::text,
  'RunrTest2026!'::text,
  'immanuelcurry@gmail.com'::text,
  'emmanuel@runr.com'::text
);
