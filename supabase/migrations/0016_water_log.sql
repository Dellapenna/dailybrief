-- 0016_water_log.sql
-- Daily water intake — one row per day, a simple glass count (each
-- glass = 8oz, the common daily-recommendation unit) rather than a full
-- log of individual pours, matching the "quick, not exhaustively
-- detailed" philosophy used elsewhere (Exercise Log, etc.).

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logged_date date not null,
  glasses_consumed integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, logged_date)
);

alter table public.water_logs enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create index water_logs_user_date_idx on public.water_logs (user_id, logged_date);
