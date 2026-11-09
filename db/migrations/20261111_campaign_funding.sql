-- Campaign funding checkout and verified Stripe payment tracking.
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
  on public.campaigns(checkout_session_id) where checkout_session_id is not null;

create table if not exists public.campaign_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
