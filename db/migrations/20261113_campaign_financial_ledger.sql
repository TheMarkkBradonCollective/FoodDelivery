-- Portr campaign financial allocations and Runner delivery payout ledger.
-- Run this migration after 20261112_campaign_setup_all_in_one.sql.
-- The mileage policy defaults are editable by authorized campaign management.
-- No delivery payout is considered earned/paid until a delivery is explicitly
-- linked to a campaign and its server-calculated payout is snapshotted.

begin;

alter table public.campaigns
  add column if not exists runner_base_pay numeric(10,2) not null default 3.00,
  add column if not exists runner_per_mile_pay numeric(10,4) not null default 1.50,
  add column if not exists runner_minimum_pay numeric(10,2) not null default 3.00,
  add column if not exists runner_maximum_pay numeric(10,2) not null default 7.50;

alter table public.campaigns
  drop constraint if exists campaigns_runner_pay_policy_check;

alter table public.campaigns
  add constraint campaigns_runner_pay_policy_check
  check (
    runner_base_pay >= 0 and runner_per_mile_pay >= 0 and
    runner_minimum_pay >= 0 and runner_maximum_pay >= runner_minimum_pay
  );

create table if not exists public.campaign_funding_allocations (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  combined_funding numeric(12,2) not null default 0 check (combined_funding >= 0),
  runner_compensation_budget numeric(12,2) not null default 0 check (runner_compensation_budget >= 0),
  platform_fee_budget numeric(12,2) not null default 0 check (platform_fee_budget >= 0),
  available_balance numeric(12,2) not null default 0 check (available_balance >= 0),
  refund_liability numeric(12,2) not null default 0 check (refund_liability >= 0),
  updated_at timestamptz not null default now()
);

-- Preserve each campaign's combined vendor-funded amount. Do not guess how
-- much should be reserved for Runner pay versus platform fees: management
-- can allocate those amounts after reviewing the campaign budget.
insert into public.campaign_funding_allocations
  (campaign_id, combined_funding, available_balance, refund_liability)
select id, funding_amount, funding_amount, refundable_amount
from public.campaigns
on conflict (campaign_id) do nothing;

create table if not exists public.campaign_financial_ledger (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  delivery_id uuid,
  runr_id uuid references public.profiles(id) on delete set null,
  entry_type text not null,
  amount numeric(12,2) not null check (amount >= 0),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint campaign_financial_ledger_type_check
    check (entry_type in ('funding','runner_compensation','platform_fee','tip_pass_through','refund','adjustment'))
);

create index if not exists campaign_financial_ledger_campaign_idx
  on public.campaign_financial_ledger(campaign_id, created_at desc);
create index if not exists campaign_financial_ledger_runner_idx
  on public.campaign_financial_ledger(runr_id, created_at desc);

alter table public.deliveries
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists deliveries_campaign_idx
  on public.deliveries(campaign_id, status);

create table if not exists public.campaign_delivery_ledger (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  delivery_id uuid not null unique references public.deliveries(id) on delete cascade,
  runr_id uuid not null references public.profiles(id) on delete restrict,
  distance_miles numeric(10,3) not null check (distance_miles >= 0),
  base_pay numeric(10,2) not null check (base_pay >= 0),
  mileage_pay numeric(10,2) not null check (mileage_pay >= 0),
  tip_amount numeric(10,2) not null default 0 check (tip_amount >= 0),
  platform_fee_amount numeric(10,2) not null default 0 check (platform_fee_amount >= 0),
  runner_total numeric(10,2) not null check (runner_total = base_pay + mileage_pay + tip_amount),
  status text not null default 'estimated',
  policy_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  earned_at timestamptz,
  paid_at timestamptz,
  constraint campaign_delivery_ledger_status_check
    check (status in ('estimated','earned','paid','voided'))
);

create index if not exists campaign_delivery_ledger_campaign_idx
  on public.campaign_delivery_ledger(campaign_id, status, created_at desc);
create index if not exists campaign_delivery_ledger_runner_idx
  on public.campaign_delivery_ledger(runr_id, status, created_at desc);

commit;

-- Verify after running:
-- select count(*) from public.campaign_funding_allocations;
-- select to_regclass('public.campaign_financial_ledger') as campaign_financial_ledger,
--        to_regclass('public.campaign_delivery_ledger') as campaign_delivery_ledger;
-- select column_name from information_schema.columns
-- where table_schema='public' and table_name='deliveries' and column_name='campaign_id';
