-- Follow-up campaign controls: atomic membership capacity counter.
alter table public.campaigns
  add column if not exists member_count integer not null default 0;

update public.campaigns c
set member_count = (
  select count(*)::int from public.campaign_members m
  where m.campaign_id = c.id and m.status = 'joined'
)
where c.member_count = 0;

alter table public.campaigns
  drop constraint if exists campaigns_member_count_check;
alter table public.campaigns
  add constraint campaigns_member_count_check
  check (member_count >= 0 and member_count <= member_capacity);
