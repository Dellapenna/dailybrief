-- 0021_banking.sql
-- Banking: a manual check register (like a paper checkbook, not real
-- bank sync — deliberately, per direct request, to avoid the real
-- security/compliance weight of live bank linking for a personal app),
-- bills with due dates, budget categories, and real per-debt tracking
-- for an actual avalanche/snowball payoff calculation (see
-- debt-payoff.ts for the math — genuine amortization, not AI-estimated).

-- One primary account. Starting balance + a single "extra toward debt"
-- amount live on user_preferences since they're single global settings,
-- not per-row data.
alter table public.user_preferences
  add column bank_starting_balance numeric(12,2),
  add column extra_monthly_debt_payment numeric(12,2);

create table public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount numeric(12,2) not null, -- positive = deposit/credit, negative = withdrawal/debit
  category text,
  cleared boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bank_transactions enable row level security;
create index bank_transactions_user_date_idx on public.bank_transactions (user_id, transaction_date);

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null,
  is_recurring boolean not null default true,
  due_day_of_month integer, -- 1-31, for recurring bills
  due_date date, -- specific date, for one-time bills
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bills enable row level security;

-- Tracks paid status per period so a recurring bill resets each month —
-- period is 'YYYY-MM' for recurring bills, or the bill's own id for
-- one-time bills (effectively a single paid/unpaid flag for those).
create table public.bill_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills (id) on delete cascade,
  period text not null,
  paid_date date not null default current_date,
  amount_paid numeric(12,2),
  created_at timestamptz not null default now(),
  unique (bill_id, period)
);

alter table public.bill_payments enable row level security;

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_name text not null,
  monthly_budget numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_name)
);

alter table public.budget_categories enable row level security;

-- interest_rate is nullable on purpose — per direct request, the payoff
-- calculator should still work with just balance + minimum_payment, just
-- less precisely (no real interest-cost math without a rate; see
-- debt-payoff.ts for exactly how it degrades gracefully).
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  balance numeric(12,2) not null,
  interest_rate numeric(5,2),
  minimum_payment numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts enable row level security;
-- No policies on any of the above — default-deny, service-role key only. See DATABASE_SCHEMA.md.
