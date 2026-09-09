-- Staff ops chat. Safe to run alone if schema.sql was already applied.
-- Also inlined in docs/supabase/schema.sql.

create table if not exists public.staff_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null default 'Staff',
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.staff_messages enable row level security;

drop policy if exists "staff_chat_read" on public.staff_messages;
create policy "staff_chat_read" on public.staff_messages
  for select to authenticated
  using (public.current_role() = 'staff');

drop policy if exists "staff_chat_write" on public.staff_messages;
create policy "staff_chat_write" on public.staff_messages
  for insert to authenticated
  with check (public.current_role() = 'staff' and author_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.staff_messages;
exception when duplicate_object then null;
end $$;
