-- 0002_tasks_and_calendar.sql
-- Phase 2: Quick-capture + Smart Today task system, and the calendar sync
-- foundation (iCloud CalDAV live now; Google/Outlook schema-ready, synced
-- later — see docs/INTEGRATIONS.md).

-- ─────────────────────────────────────────────────────────────────────────
-- tasks
-- ─────────────────────────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  notes text,
  pillar_id text references public.life_pillars (id),
  project text,                      -- free-text project label (Option C: no separate project hierarchy)
  status text not null default 'inbox'
    check (status in ('inbox', 'today', 'this_week', 'someday', 'waiting', 'completed')),
  flagged boolean not null default false,
  due_date date,
  completed_at timestamptz,
  source text not null default 'manual'
    check (source in ('manual', 'ai_recommended', 'calendar', 'goal', 'weekly_review', 'morning_briefing')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_due_date_idx on public.tasks (user_id, due_date);

-- ─────────────────────────────────────────────────────────────────────────
-- calendar_connections — one row per calendar provider the user connects.
-- Credentials referenced here are never the raw secret: CalDAV app-specific
-- passwords and OAuth refresh tokens live in Netlify env vars / a secrets
-- store, never in this table. This just tracks connection *state*.
-- ─────────────────────────────────────────────────────────────────────────
create table public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('icloud', 'google', 'outlook')),
  display_name text,                 -- e.g. "Work Outlook", "Personal iCloud"
  status text not null default 'disconnected'
    check (status in ('disconnected', 'connected', 'error')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.calendar_connections enable row level security;

create trigger set_calendar_connections_updated_at
  before update on public.calendar_connections
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- calendar_events — normalized cache of events pulled from any connected
-- provider. The UI only ever reads from here, never hits providers live,
-- so one slow/failing provider never blocks the page from rendering.
-- ─────────────────────────────────────────────────────────────────────────
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  connection_id uuid references public.calendar_connections (id) on delete cascade,
  provider text not null check (provider in ('icloud', 'google', 'outlook')),
  provider_event_id text not null,   -- the event's UID from the source calendar
  title text not null,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, provider, provider_event_id)
);

alter table public.calendar_events enable row level security;

create index calendar_events_user_starts_idx on public.calendar_events (user_id, starts_at);
