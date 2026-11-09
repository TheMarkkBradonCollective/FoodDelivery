-- Portr campaign marketplace: consolidated one-time setup
-- Run this entire file once in the Neon SQL Editor.
-- It combines the three original campaign migrations in their required order:
--   1) campaign marketplace foundation
--   2) membership capacity controls
--   3) Stripe campaign funding tracking
--
-- Do not run the three original files separately if you run this consolidated file.
-- This file does not deploy application code, configure Stripe, or create the later
-- delivery payout/earnings schema. Those application features require a follow-up
-- implementation and migration after the existing order/delivery data model is mapped.

begin;

-- ---------------------------------------------------------------------------
-- 1. Campaign marketplace foundation
-- ---------------------------------------------------------------------------

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  company_business_id uuid references public.businesses(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  name text not null,
  description text not null default '',
  campaign_type text not null default 'brand',
  city text not null default '',
  service_area text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  enrollment_deadline timestamptz not null,
  operating_schedule jsonb not null default '{"mode":"always","days":{}}'::jsonb,
  member_capacity integer not null,
  minimum_members integer not null default 1,
  max_active_runrs integer not null,
  active_runrs integer not null default 0,
  status text not null default 'recruiting',
  funding_amount numeric(12,2) not null default 0,
  refundable_amount numeric(12,2) not null default 0,
  payment_reference text,
  refund_status text not null default 'not_required',
  refund_reference text,
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_dates_check check (ends_at > starts_at and enrollment_deadline <= starts_at),
  constraint campaigns_capacity_check check (member_capacity > 0 and minimum_members > 0 and minimum_members <= member_capacity and max_active_runrs > 0),
  constraint campaigns_active_count_check check (active_runrs >= 0 and active_runrs <= max_active_runrs),
  constraint campaigns_status_check check (status in ('draft','upcoming','recruiting','live','full','paused','completed','void','cancelled')),
  constraint campaigns_refund_status_check check (refund_status in ('not_required','not_due','pending','processing','refunded','failed'))
);

create index if not exists campaigns_status_dates_idx
  on public.campaigns(status, starts_at, ends_at);
create index if not exists campaigns_company_idx
  on public.campaigns(company_business_id);

create table if not exists public.campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  runr_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'joined',
  joined_at timestamptz not null default now(),
  unique(campaign_id, runr_id),
  constraint campaign_members_status_check check (status in ('joined','removed','withdrawn'))
);

create index if not exists campaign_members_runner_idx
  on public.campaign_members(runr_id, status);
create index if not exists campaign_members_campaign_idx
  on public.campaign_members(campaign_id, status);

-- Enrollment and active working capacity are intentionally separate:
-- joining multiple campaigns does not reserve an active Runner slot.
create table if not exists public.campaign_presence (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  runr_id uuid not null references public.profiles(id) on delete cascade,
  went_online_at timestamptz not null default now(),
  went_offline_at timestamptz,
  unique(campaign_id, runr_id, went_online_at)
);

create unique index if not exists campaign_presence_one_active_idx
  on public.campaign_presence(campaign_id, runr_id)
  where went_offline_at is null;
create index if not exists campaign_presence_active_idx
  on public.campaign_presence(campaign_id)
  where went_offline_at is null;

create table if not exists public.campaign_refund_ledger (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending',
  payment_reference text,
  refund_reference text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint campaign_refund_ledger_status_check check (status in ('pending','processing','refunded','failed'))
);

-- ---------------------------------------------------------------------------
-- 2. Membership capacity counter
-- ---------------------------------------------------------------------------

alter table public.campaigns
  add column if not exists member_count integer not null default 0;

update public.campaigns c
set member_count = (
  select count(*)::int
  from public.campaign_members m
  where m.campaign_id = c.id and m.status = 'joined'
)
where c.member_count = 0;

alter table public.campaigns
  drop constraint if exists campaigns_member_count_check;

alter table public.campaigns
  add constraint campaigns_member_count_check
  check (member_count >= 0 and member_count <= member_capacity);

-- ---------------------------------------------------------------------------
-- 3. Stripe campaign funding and verified webhook event tracking
-- ---------------------------------------------------------------------------

alter table public.campaigns
  add column if not exists funding_status text not null default 'unfunded',
  add column if not exists checkout_session_id text,
  add column if not exists funding_paid_at timestamptz;

alter table public.campaigns
  drop constraint if exists campaigns_funding_status_check;

alter table public.campaigns
  add constraint campaigns_funding_status_check
  check (funding_status in ('unfunded','checkout_open','paid','refund_pending','refunded','payment_failed'));

create unique index if not exists campaigns_checkout_session_idx
  on public.campaigns(checkout_session_id)
  where checkout_session_id is not null;

create table if not exists public.campaign_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

commit;

-- Quick verification after successful execution:
-- select to_regclass('public.campaigns') as campaigns,
--        to_regclass('public.campaign_members') as campaign_members,
--        to_regclass('public.campaign_presence') as campaign_presence,
--        to_regclass('public.campaign_refund_ledger') as campaign_refund_ledger,
--        to_regclass('public.campaign_stripe_events') as campaign_stripe_events;
-- select column_name from information_schema.columns
-- where table_schema='public' and table_name='campaigns'
--   and column_name in ('member_count','funding_status','checkout_session_id','funding_paid_at')
-- order by column_name;
