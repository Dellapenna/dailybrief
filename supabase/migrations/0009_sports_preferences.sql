-- 0009_sports_preferences.sql
-- Configurable favorite sports teams, replacing the hardcoded list in
-- sports.ts. Matches "sports_preferences" from the brief's original
-- suggested table list, finally implemented. Seeded with the same 4
-- teams that were hardcoded before, so nothing changes for the current
-- experience until edited in Settings.

create table public.sports_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, team_name)
);

alter table public.sports_preferences enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

insert into public.sports_preferences (user_id, team_name) values
  ('11111111-1111-1111-1111-111111111111', 'Philadelphia Eagles'),
  ('11111111-1111-1111-1111-111111111111', 'Philadelphia Phillies'),
  ('11111111-1111-1111-1111-111111111111', 'Philadelphia 76ers'),
  ('11111111-1111-1111-1111-111111111111', 'Philadelphia Flyers')
on conflict (user_id, team_name) do nothing;
