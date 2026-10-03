-- Building access on orders and deliveries, plus what each Runner will use.
-- Safe to re-run. Apply after complete-schema.sql on an existing project.

alter table public.profiles add column if not exists access_preference text;
alter table public.profiles drop constraint if exists profiles_access_preference_check;
alter table public.profiles add constraint profiles_access_preference_check
  check (
    access_preference is null
    or access_preference in ('elevators', 'stairs', 'both', 'no_elevators', 'no_stairs')
  );

alter table public.orders add column if not exists building_access text;
alter table public.orders add column if not exists access_note text;
alter table public.orders add column if not exists access_notice text;
alter table public.orders drop constraint if exists orders_building_access_check;
alter table public.orders add constraint orders_building_access_check
  check (
    building_access is null
    or building_access in (
      'elevator', 'stairs', 'both', 'ground', 'requires_stairs', 'requires_elevator'
    )
  );
alter table public.orders drop constraint if exists orders_access_notice_check;
alter table public.orders add constraint orders_access_notice_check
  check (
    access_notice is null
    or access_notice in ('stairs_may_be_required', 'elevator_may_be_required')
  );

alter table public.deliveries add column if not exists building_access text;
alter table public.deliveries add column if not exists access_note text;
alter table public.deliveries add column if not exists access_notice text;
alter table public.deliveries drop constraint if exists deliveries_building_access_check;
alter table public.deliveries add constraint deliveries_building_access_check
  check (
    building_access is null
    or building_access in (
      'elevator', 'stairs', 'both', 'ground', 'requires_stairs', 'requires_elevator'
    )
  );
alter table public.deliveries drop constraint if exists deliveries_access_notice_check;
alter table public.deliveries add constraint deliveries_access_notice_check
  check (
    access_notice is null
    or access_notice in ('stairs_may_be_required', 'elevator_may_be_required')
  );
