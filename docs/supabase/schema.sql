-- Optional profiles table for RUNR platform roles and display names.
-- Run in the Supabase SQL editor if you want roles stored in the database
-- instead of only in auth user metadata.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role text not null default 'customer' check (role in ('customer', 'runr', 'business', 'staff')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Staff can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'staff'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile row on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
