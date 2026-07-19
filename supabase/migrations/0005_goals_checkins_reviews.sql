-- 0005_goals_checkins_reviews.sql
-- Goals (90-day missions), Morning Check-in, Evening Review — the last
-- pieces of the original Phase 2 scope (deferred out of the earlier
-- revision, built now).

-- ─────────────────────────────────────────────────────────────────────────
-- goals
-- ─────────────────────────────────────────────────────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  pillar_id text references public.life_pillars (id),
  why_it_matters text,
  start_date date not null default current_date,
  target_date date,
  starting_point text,
  target_result text,
  current_result text,
  status text not null default 'active'
    check (status in ('active', 'completed', 'paused', 'abandoned')),
  weekly_target text,
  next_action text,
  obstacles text,
  confidence_level int check (confidence_level between 1 and 5),
  -- Per the brief: never present this as scientifically precise.
  estimated_probability int check (estimated_probability between 0 and 100),
  probability_method text not null default 'user_entered'
    check (probability_method in ('user_entered', 'rules_based')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create trigger set_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create index goals_user_status_idx on public.goals (user_id, status);

create table public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  title text not null,
  target_date date,
  completed_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.goal_milestones enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- morning_checkins — one per (user_id, checkin_date). All fields nullable
-- except the date — per the brief, nothing here is mandatory.
-- ─────────────────────────────────────────────────────────────────────────
create table public.morning_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  checkin_date date not null,
  sleep_duration numeric(4,1),
  sleep_quality int check (sleep_quality between 1 and 5),
  energy int check (energy between 1 and 5),
  mood int check (mood between 1 and 5),
  stress int check (stress between 1 and 5),
  glucose int,
  weight numeric(6,2),
  symptoms text,
  planned_exercise text,
  biggest_concern text,
  most_important_outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

alter table public.morning_checkins enable row level security;

create trigger set_morning_checkins_updated_at
  before update on public.morning_checkins
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- evening_reviews — one per (user_id, review_date).
-- ─────────────────────────────────────────────────────────────────────────
create table public.evening_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  review_date date not null,
  went_well text,
  went_poorly text,
  lesson text,
  tomorrow_focus text,
  day_rating int check (day_rating between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, review_date)
);

alter table public.evening_reviews enable row level security;

create trigger set_evening_reviews_updated_at
  before update on public.evening_reviews
  for each row execute function public.set_updated_at();
