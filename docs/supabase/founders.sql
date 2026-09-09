-- =============================================================================
-- RUNR founders only — run this block in Supabase SQL Editor
-- Creates upsert_runr_founder + both founder accounts (self-contained).
-- =============================================================================

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists personal_email text;
alter table public.profiles add column if not exists company_email text;

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
    '00000000-0000-0000-0000-000000000000'::uuid,
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

-- Remove old duplicate founder rows if they exist
delete from auth.identities where user_id in (
  'b1000000-0000-4000-8000-000000000005'::uuid,
  'b1000000-0000-4000-8000-000000000006'::uuid,
  'b1000000-0000-4000-8000-000000000007'::uuid,
  'b1000000-0000-4000-8000-000000000008'::uuid
);
delete from public.profiles where id in (
  'b1000000-0000-4000-8000-000000000005'::uuid,
  'b1000000-0000-4000-8000-000000000006'::uuid,
  'b1000000-0000-4000-8000-000000000007'::uuid,
  'b1000000-0000-4000-8000-000000000008'::uuid
);
delete from auth.users where id in (
  'b1000000-0000-4000-8000-000000000005'::uuid,
  'b1000000-0000-4000-8000-000000000006'::uuid,
  'b1000000-0000-4000-8000-000000000007'::uuid,
  'b1000000-0000-4000-8000-000000000008'::uuid
);

select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000001'::uuid,
  'Markeith White'::text,
  'RunrTest2026!'::text,
  'Markkisstickz96@gmail.com'::text,
  'markeith@runr.com'::text
);

select public.upsert_runr_founder(
  'f0000000-0000-4000-8000-000000000002'::uuid,
  'Immanuel Curry'::text,
  'RunrTest2026!'::text,
  'Immanuelcurry@gmail.com'::text,
  'immanuel@runr.com'::text
);
