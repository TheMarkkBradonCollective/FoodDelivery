-- =============================================================================
-- RUNR marketplace — tables, RLS, realtime, seed listings
-- Appended from docs/supabase/marketplace.sql (also run via schema.sql)
-- =============================================================================

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

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

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  cuisine text not null default '',
  category text not null default 'Restaurant',
  rating numeric not null default 4.8,
  review_count integer not null default 24,
  lat double precision not null,
  lng double precision not null,
  address text not null default '',
  city text not null default 'San Francisco',
  zip text not null default '94103',
  delivery_radius_miles numeric not null default 5,
  operating_hours text not null default '10:00 AM – 10:00 PM',
  delivery_fee numeric not null default 2.99,
  eta_minutes integer not null default 28,
  demand_level text not null default 'moderate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.businesses add column if not exists cuisine text not null default '';
alter table public.businesses add column if not exists category text not null default 'Restaurant';
alter table public.businesses add column if not exists rating numeric not null default 4.8;
alter table public.businesses add column if not exists review_count integer not null default 24;
alter table public.businesses add column if not exists lat double precision not null default 37.7749;
alter table public.businesses add column if not exists lng double precision not null default -122.4194;
alter table public.businesses add column if not exists address text not null default '';
alter table public.businesses add column if not exists city text not null default 'San Francisco';
alter table public.businesses add column if not exists zip text not null default '94103';
alter table public.businesses add column if not exists delivery_radius_miles numeric not null default 5;
alter table public.businesses add column if not exists operating_hours text not null default '10:00 AM – 10:00 PM';
alter table public.businesses add column if not exists delivery_fee numeric not null default 2.99;
alter table public.businesses add column if not exists eta_minutes integer not null default 28;
alter table public.businesses add column if not exists demand_level text not null default 'moderate';

create or replace function public.owns_business(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = p_id and b.owner_id = auth.uid()
  )
$$;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric not null,
  category text not null default 'Mains',
  popular boolean not null default false
);

create table if not exists public.coverage_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  start_time text not null,
  end_time text not null,
  max_runrs integer not null default 4
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  runr_id uuid references auth.users (id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  service_fee numeric not null default 0,
  tax numeric not null default 0,
  tip numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  runr_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  start_time text not null,
  end_time text not null,
  status text not null default 'scheduled',
  check_in_time timestamptz,
  check_out_time timestamptz,
  delivery_count integer not null default 0,
  earnings numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  runr_id uuid references auth.users (id) on delete set null,
  pickup_lat double precision not null,
  pickup_lng double precision not null,
  dropoff_lat double precision not null,
  dropoff_lng double precision not null,
  distance_miles numeric not null default 1.2,
  status text not null default 'offered',
  base_pay numeric not null default 4.5,
  distance_pay numeric not null default 1.8,
  tip numeric not null default 5,
  total_earnings numeric not null default 11.3,
  estimated_minutes integer not null default 18,
  customer_name text not null default 'Customer',
  created_at timestamptz not null default now()
);

create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  runr_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  business_name text not null default '',
  delivery_id uuid references public.deliveries (id) on delete set null,
  base_pay numeric not null default 0,
  distance_pay numeric not null default 0,
  tip numeric not null default 0,
  total numeric not null default 0,
  completed_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'order',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  primary key (user_id, business_id)
);

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.menu_items enable row level security;
alter table public.coverage_rules enable row level security;
alter table public.orders enable row level security;
alter table public.runs enable row level security;
alter table public.deliveries enable row level security;
alter table public.earnings enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "biz_select" on public.businesses;
create policy "biz_select" on public.businesses for select to authenticated using (true);
drop policy if exists "biz_write" on public.businesses;
create policy "biz_write" on public.businesses for all to authenticated
  using (owner_id = auth.uid() or public.is_staff())
  with check (owner_id = auth.uid() or public.is_staff());

drop policy if exists "menu_select" on public.menu_items;
create policy "menu_select" on public.menu_items for select to authenticated using (true);
drop policy if exists "menu_write" on public.menu_items;
create policy "menu_write" on public.menu_items for all to authenticated
  using (public.owns_business(business_id) or public.is_staff())
  with check (public.owns_business(business_id) or public.is_staff());

drop policy if exists "cov_select" on public.coverage_rules;
create policy "cov_select" on public.coverage_rules for select to authenticated using (true);
drop policy if exists "cov_write" on public.coverage_rules;
create policy "cov_write" on public.coverage_rules for all to authenticated
  using (public.owns_business(business_id) or public.is_staff())
  with check (public.owns_business(business_id) or public.is_staff());

drop policy if exists "ord_select" on public.orders;
create policy "ord_select" on public.orders for select to authenticated
  using (
    customer_id = auth.uid()
    or runr_id = auth.uid()
    or public.owns_business(business_id)
    or (public.is_staff() or public.current_role() = 'runr')
  );
drop policy if exists "ord_insert" on public.orders;
create policy "ord_insert" on public.orders for insert to authenticated
  with check (customer_id = auth.uid() or public.is_staff());
drop policy if exists "ord_update" on public.orders;
create policy "ord_update" on public.orders for update to authenticated
  using (
    customer_id = auth.uid()
    or runr_id = auth.uid()
    or public.owns_business(business_id)
    or (public.is_staff() or public.current_role() = 'runr')
  );

drop policy if exists "run_select" on public.runs;
create policy "run_select" on public.runs for select to authenticated using (true);
drop policy if exists "run_insert" on public.runs;
create policy "run_insert" on public.runs for insert to authenticated
  with check (runr_id = auth.uid() or public.is_staff());
drop policy if exists "run_update" on public.runs;
create policy "run_update" on public.runs for update to authenticated
  using (runr_id = auth.uid() or public.owns_business(business_id) or public.is_staff());

drop policy if exists "del_select" on public.deliveries;
create policy "del_select" on public.deliveries for select to authenticated using (true);
drop policy if exists "del_write" on public.deliveries;
create policy "del_write" on public.deliveries for all to authenticated
  using (true) with check (true);

drop policy if exists "earn_select" on public.earnings;
create policy "earn_select" on public.earnings for select to authenticated
  using (runr_id = auth.uid() or public.is_staff());
drop policy if exists "earn_insert" on public.earnings;
create policy "earn_insert" on public.earnings for insert to authenticated
  with check (runr_id = auth.uid() or public.is_staff());

drop policy if exists "noti_own" on public.notifications;
create policy "noti_own" on public.notifications for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "noti_staff" on public.notifications;
create policy "noti_staff" on public.notifications for select to authenticated
  using (public.is_staff());

drop policy if exists "fav_own" on public.favorites;
create policy "fav_own" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.runs;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.deliveries;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.businesses;
exception when duplicate_object then null;
end $$;

-- Seed marketplace for vendr@test.portr.com (created above)
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

delete from public.menu_items where business_id in (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003'
);

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

delete from public.coverage_rules where business_id in (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003'
);

insert into public.coverage_rules (id, business_id, start_time, end_time, max_runrs) values
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '11:00', '14:00', 4),
  ('e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', '17:00', '22:00', 6),
  ('e1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', '10:00', '15:00', 3),
  ('e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000002', '17:00', '21:00', 5),
  ('e1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000003', '11:00', '23:00', 5);

alter table public.profiles add column if not exists access_preference text;
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists building_access text;
alter table public.orders add column if not exists access_note text;
alter table public.orders add column if not exists access_notice text;
alter table public.deliveries add column if not exists building_access text;
alter table public.deliveries add column if not exists access_note text;
alter table public.deliveries add column if not exists access_notice text;
