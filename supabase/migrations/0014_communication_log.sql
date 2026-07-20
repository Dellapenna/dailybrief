-- 0014_communication_log.sql
-- Communication Practice Journal for Mind — log real interactions and
-- reflect on them. This is where the actual skill-building happens
-- (reflecting on real moments), as opposed to communication-tip.ts's
-- passive daily tip, which is just light inspiration on top.

create table public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  situation text not null,
  went_well text,
  improve text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.communication_logs enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create index communication_logs_user_logged_idx on public.communication_logs (user_id, logged_at);
