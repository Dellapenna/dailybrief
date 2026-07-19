-- 0004_ideas_and_habits.sql
-- Idea Vault and Habits, per docs/PRODUCT_BRIEF.md's original spec for
-- both — deferred out of the Phase 2 revision, built now.

-- ─────────────────────────────────────────────────────────────────────────
-- ideas — Idea Vault. Deliberately NOT auto-promoted to projects/tasks;
-- status tracks review lifecycle instead.
-- ─────────────────────────────────────────────────────────────────────────
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  category text,
  potential_value text,
  estimated_effort text,
  strategic_fit text,
  status text not null default 'captured'
    check (status in ('captured', 'reviewing', 'prioritized', 'building', 'paused', 'rejected', 'completed')),
  date_captured date not null default current_date,
  next_review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ideas enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create trigger set_ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

create index ideas_user_status_idx on public.ideas (user_id, status);

-- ─────────────────────────────────────────────────────────────────────────
-- habits + habit_entries
-- Streaks/success-rate are computed at read time in
-- netlify/functions/habits.ts, never stored — see DATABASE_SCHEMA.md.
-- Assumption: v1 treats every habit as daily-frequency. `frequency` is
-- stored for future use (e.g. "3x/week") but the streak math below
-- doesn't yet account for anything other than daily.
-- ─────────────────────────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  pillar_id text references public.life_pillars (id),
  frequency text not null default 'daily',
  target int not null default 1,
  reminder_time time,
  archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create trigger set_habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  entry_date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, entry_date)
);

alter table public.habit_entries enable row level security;

create index habit_entries_habit_date_idx on public.habit_entries (habit_id, entry_date);
