-- 0013_market_preferences.sql
-- Configurable stock and crypto watchlists, replacing the hardcoded
-- lists in stocks.ts / crypto.ts. Same pattern as
-- 0009_sports_preferences.sql. Seeded with what was previously
-- hardcoded, so nothing changes until edited in Settings.

create table public.stock_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  symbol text not null,
  label text,
  created_at timestamptz not null default now(),
  unique (user_id, symbol)
);

alter table public.stock_preferences enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

insert into public.stock_preferences (user_id, symbol, label) values
  ('11111111-1111-1111-1111-111111111111', 'DIA', 'Dow Jones (DIA)'),
  ('11111111-1111-1111-1111-111111111111', 'SPY', 'S&P 500 (SPY)'),
  ('11111111-1111-1111-1111-111111111111', 'QQQ', 'Nasdaq 100 (QQQ)'),
  ('11111111-1111-1111-1111-111111111111', 'IWM', 'Russell 2000 (IWM)')
on conflict (user_id, symbol) do nothing;

create table public.crypto_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  coin_id text not null,
  label text not null,
  created_at timestamptz not null default now(),
  unique (user_id, coin_id)
);

alter table public.crypto_preferences enable row level security;

insert into public.crypto_preferences (user_id, coin_id, label) values
  ('11111111-1111-1111-1111-111111111111', 'bitcoin', 'Bitcoin'),
  ('11111111-1111-1111-1111-111111111111', 'ethereum', 'Ethereum'),
  ('11111111-1111-1111-1111-111111111111', 'solana', 'Solana')
on conflict (user_id, coin_id) do nothing;
