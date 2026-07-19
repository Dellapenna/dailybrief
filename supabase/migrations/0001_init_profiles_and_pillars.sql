-- 0001_init_profiles_and_pillars.sql
-- Foundation tables for a single-primary-user instance gated by Netlify
-- Password Protection (not Supabase Auth). All access to these tables
-- happens server-side, through Netlify Functions using the service-role
-- key, scoped by the fixed PRIMARY_USER_ID env var — see
-- docs/ARCHITECTURE.md "Data flow / security boundary" for why.

-- ─────────────────────────────────────────────────────────────────────────
-- Shared trigger: keep updated_at current on every update
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- life_pillars — global reference table
-- ─────────────────────────────────────────────────────────────────────────
create table public.life_pillars (
  id text primary key,               -- 'body' | 'mind' | 'family' | 'career' | 'builder' | 'life'
  label text not null,
  sort_order int not null,
  created_at timestamptz not null default now()
);

insert into public.life_pillars (id, label, sort_order) values
  ('body', 'Body', 1),
  ('mind', 'Mind', 2),
  ('family', 'Family', 3),
  ('career', 'Career', 4),
  ('builder', 'Builder', 5),
  ('life', 'Life', 6);

-- RLS enabled with no policies: default-deny for anon/authenticated roles.
-- Nothing reads this directly from the browser — only the service-role
-- key (via Netlify Functions) does, and service-role bypasses RLS by
-- design. This is defense-in-depth in case a client-side key is ever
-- introduced later, not the primary access control.
alter table public.life_pillars enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — a single row for the primary user. Not tied to Supabase Auth
-- (this instance has no sign-up/sign-in flow), so no FK to auth.users.
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  timezone text not null default 'America/New_York',
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- user_preferences — one row per profile (in practice: one row, total)
-- ─────────────────────────────────────────────────────────────────────────
create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  morning_delivery_time time not null default '06:30',
  evening_delivery_time time not null default '20:30',
  weather_units text not null default 'imperial' check (weather_units in ('imperial', 'metric')),
  preferred_brief_length text not null default 'standard'
    check (preferred_brief_length in ('short', 'standard', 'deep')),
  location_label text,
  location_lat double precision,
  location_lng double precision,
  brief_category_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Seed the one profile this instance will ever have.
--
-- Fixed UUID chosen deliberately (not random) so it's reproducible and can
-- be referenced from Netlify environment variables (PRIMARY_USER_ID) and
-- future migrations without a lookup query. It is not a secret — it only
-- has meaning combined with the service-role key, which stays server-side.
-- ─────────────────────────────────────────────────────────────────────────
insert into public.profiles (id, display_name, timezone)
values ('11111111-1111-1111-1111-111111111111', 'Ryan', 'America/New_York');

insert into public.user_preferences (user_id)
values ('11111111-1111-1111-1111-111111111111');
