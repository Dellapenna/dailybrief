-- 0003_horoscope.sql
-- Adds a zodiac sign preference and a once-per-day horoscope cache.
-- Horoscope content is AI-generated, playful entertainment content — see
-- netlify/functions/horoscope.ts — never presented as a factual forecast.
-- This is a deliberate exception to "evidence over invention" for factual
-- data (weather, markets, etc.): horoscopes are inherently non-factual,
-- so generating them is fine as long as they're clearly labeled as such.

alter table public.user_preferences
  add column zodiac_sign text check (zodiac_sign in (
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ));

create table public.horoscopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  horoscope_date date not null,
  sign text not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (user_id, horoscope_date)
);

alter table public.horoscopes enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.
