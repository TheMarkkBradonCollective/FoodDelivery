-- =============================================================================
-- Add Portr founders (run after complete-schema.sql)
-- =============================================================================
-- Staff positions already exist: support, moderator, administrator, manager,
-- director, and founder. This snippet adds the two founders (role = founder).
-- They sign in to Portr Command the same way as other staff.
--
-- Portr — https://portr.com
-- Password until changed: RunrTest2026!
-- =============================================================================

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists personal_email text;
alter table public.profiles add column if not exists company_email text;
alter table public.profiles add column if not exists is_founder boolean not null default false;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in (
    'customer', 'runr', 'business',
    'staff', 'support', 'moderator', 'administrator', 'manager', 'director', 'founder'
  ));

update public.profiles
set role = 'founder'
where is_founder and role is distinct from 'founder';

alter table public.profiles drop constraint if exists profiles_founder_is_staff;
alter table public.profiles add constraint profiles_founder_is_staff
  check (is_founder = (role = 'founder'));

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in (
        'staff', 'support', 'moderator', 'administrator', 'manager', 'director', 'founder'
      )
  );
$$;

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
      'role', 'founder'
    ),
    jsonb_build_object(
      'name', p_name,
      'role', 'founder',
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
    'founder',
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        personal_email = excluded.personal_email,
        company_email = excluded.company_email,
        name = excluded.name,
        role = 'founder',
        is_founder = true,
        updated_at = now();
end;
$$;

-- Markeith White — founder
select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000001'::uuid,
  'Markeith White'::text,
  'RunrTest2026!'::text,
  'markkisstickz96@gmail.com'::text,
  'markeith@portr.com'::text
);

-- Emmanuel Cury — founder
select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000002'::uuid,
  'Emmanuel Cury'::text,
  'RunrTest2026!'::text,
  'ecurry@portr.com'::text,
  'ecurry@portr.com'::text
);
