-- Portr — Neon Postgres schema (matches live project "Portr", divine-sound-61675218)
-- No RLS; access control is enforced in apps/api Worker.
-- User ids are plain uuid columns (no auth.users FKs). profiles.password_hash + unique lower(email).
-- Apply on a fresh database: psql "$DATABASE_URL" -f db/schema.sql

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text, personal_email text, company_email text, name text,
  role text not null default 'customer',
  is_founder boolean not null default false,
  avatar_url text, access_preference text, password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('customer','runr','business','staff','support','moderator','administrator','manager','director','founder')),
  constraint profiles_founder_is_staff check (is_founder = (role = 'founder')),
  constraint profiles_access_preference_check check (access_preference is null or access_preference in ('elevators','stairs','both','no_elevators','no_stairs'))
);

create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create or replace function public.set_updated_at() returns trigger language plpgsql as $f$ begin new.updated_at = now(); return new; end; $f$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null, name text not null,
  cuisine text not null default '', category text not null default 'Restaurant',
  rating numeric not null default 4.8, review_count integer not null default 24,
  lat double precision not null, lng double precision not null,
  address text not null default '', city text not null default 'San Francisco', zip text not null default '94103',
  delivery_radius_miles numeric not null default 5, operating_hours text not null default '10:00 AM – 10:00 PM',
  delivery_fee numeric not null default 2.99, eta_minutes integer not null default 28,
  demand_level text not null default 'moderate',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create trigger businesses_set_updated_at before update on public.businesses for each row execute procedure public.set_updated_at();

create table if not exists public.menu_items (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, name text not null, description text not null default '', price numeric not null, category text not null default 'Mains', popular boolean not null default false);

create table if not exists public.coverage_rules (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, start_time text not null, end_time text not null, max_runrs integer not null default 4);

create table if not exists public.orders (id uuid primary key default gen_random_uuid(), customer_id uuid not null, business_id uuid not null references public.businesses(id) on delete cascade, runr_id uuid, items jsonb not null default '[]'::jsonb, subtotal numeric not null default 0, delivery_fee numeric not null default 0, service_fee numeric not null default 0, tax numeric not null default 0, tip numeric not null default 0, total numeric not null default 0, status text not null default 'new', created_at timestamptz not null default now(), delivery_address text, building_access text, access_note text, access_notice text,
  constraint orders_building_access_check check (building_access is null or building_access in ('elevator','stairs','both','ground','requires_stairs','requires_elevator')),
  constraint orders_access_notice_check check (access_notice is null or access_notice in ('stairs_may_be_required','elevator_may_be_required')));

create table if not exists public.runs (id uuid primary key default gen_random_uuid(), runr_id uuid not null, business_id uuid not null references public.businesses(id) on delete cascade, start_time text not null, end_time text not null, status text not null default 'scheduled', check_in_time timestamptz, check_out_time timestamptz, delivery_count integer not null default 0, earnings numeric not null default 0, created_at timestamptz not null default now());

create table if not exists public.deliveries (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, business_id uuid not null references public.businesses(id) on delete cascade, runr_id uuid, pickup_lat double precision not null, pickup_lng double precision not null, dropoff_lat double precision not null, dropoff_lng double precision not null, distance_miles numeric not null default 1.2, status text not null default 'offered', base_pay numeric not null default 4.5, distance_pay numeric not null default 1.8, tip numeric not null default 5, total_earnings numeric not null default 11.3, estimated_minutes integer not null default 18, customer_name text not null default 'Customer', created_at timestamptz not null default now(), building_access text, access_note text, access_notice text,
  constraint deliveries_building_access_check check (building_access is null or building_access in ('elevator','stairs','both','ground','requires_stairs','requires_elevator')),
  constraint deliveries_access_notice_check check (access_notice is null or access_notice in ('stairs_may_be_required','elevator_may_be_required')));

create table if not exists public.earnings (id uuid primary key default gen_random_uuid(), runr_id uuid not null, business_id uuid not null references public.businesses(id) on delete cascade, business_name text not null default '', delivery_id uuid references public.deliveries(id) on delete set null, base_pay numeric not null default 0, distance_pay numeric not null default 0, tip numeric not null default 0, total numeric not null default 0, completed_at timestamptz not null default now());

create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, body text not null default '', type text not null default 'order', read boolean not null default false, created_at timestamptz not null default now());

create table if not exists public.favorites (user_id uuid not null, business_id uuid not null references public.businesses(id) on delete cascade, primary key (user_id, business_id));

create table if not exists public.staff_messages (id uuid primary key default gen_random_uuid(), author_id uuid, author_name text not null default 'Staff', body text not null, created_at timestamptz not null default now());

insert into public.businesses (
  id, owner_id, name, cuisine, category, rating, review_count,
  lat, lng, address, city, zip, delivery_radius_miles, operating_hours,
  delivery_fee, eta_minutes, demand_level
) values
  (
    'c1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000003',
    'Tony''s Pizza',
    'Pizza',
    'Restaurant',
    4.7, 312,
    37.7849, -122.4094,
    '450 Mission St', 'San Francisco', '94105',
    5, '11:00 AM – 11:00 PM', 2.99, 25, 'high'
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000003',
    'Golden Gate Burgers',
    'Burgers',
    'Restaurant',
    4.5, 188,
    37.7699, -122.4314,
    '1200 Market St', 'San Francisco', '94102',
    4.5, '10:00 AM – 10:00 PM', 1.99, 22, 'moderate'
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000003',
    'Mission Tacos',
    'Mexican',
    'Restaurant',
    4.8, 421,
    37.7599, -122.4194,
    '2400 Mission St', 'San Francisco', '94110',
    5, '10:00 AM – 12:00 AM', 2.49, 20, 'busy'
  )
on conflict (id) do update set
  name = excluded.name,
  cuisine = excluded.cuisine,
  lat = excluded.lat,
  lng = excluded.lng,
  demand_level = excluded.demand_level,
  updated_at = now();

insert into public.menu_items (id, business_id, name, description, price, category, popular) values
  ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Margherita Pizza', 'San Marzano tomato, mozzarella, basil', 16.50, 'Pizza', true),
  ('d1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Pepperoni Pizza', 'Cup-and-char pepperoni, mozzarella', 18.00, 'Pizza', true),
  ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'Caesar Salad', 'Romaine, parmesan, croutons', 11.00, 'Salads', false),
  ('d1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Garlic Knots', 'Six knots, house marinara', 7.50, 'Sides', false),
  ('d1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000002', 'Cheeseburger', 'Chuck patty, american, pickles', 14.00, 'Burgers', true),
  ('d1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', 'Double Smash', 'Two smash patties, secret sauce', 17.50, 'Burgers', true),
  ('d1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000002', 'Fries', 'Crispy russet fries, sea salt', 4.50, 'Sides', false),
  ('d1000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000002', 'Shake', 'Vanilla, chocolate, or strawberry', 6.00, 'Drinks', false),
  ('d1000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000003', 'Carne Asada Tacos', 'Three street tacos, salsa verde', 13.50, 'Tacos', true),
  ('d1000000-0000-4000-8000-00000000000a', 'c1000000-0000-4000-8000-000000000003', 'Al Pastor Bowl', 'Pastor, rice, beans, pineapple', 15.00, 'Bowls', true),
  ('d1000000-0000-4000-8000-00000000000b', 'c1000000-0000-4000-8000-000000000003', 'Guacamole', 'Tableside-style, chips', 8.00, 'Sides', false),
  ('d1000000-0000-4000-8000-00000000000c', 'c1000000-0000-4000-8000-000000000003', 'Horchata', 'Cinnamon rice milk', 4.00, 'Drinks', false);

insert into public.coverage_rules (id, business_id, start_time, end_time, max_runrs) values
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '11:00', '14:00', 4),
  ('e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', '17:00', '22:00', 6),
  ('e1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', '10:00', '15:00', 3),
  ('e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000002', '17:00', '21:00', 5),
  ('e1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000003', '11:00', '23:00', 5);
