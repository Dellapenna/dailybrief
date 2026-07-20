-- 0010_food_log.sql
-- Calorie counter for Body — quick food logging (with real database
-- search via USDA FoodData Central) plus a daily calorie goal.

alter table public.user_preferences
  add column daily_calorie_goal int;

create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  food_name text not null,
  meal text not null default 'snack' check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  calories numeric(7,1) not null,
  protein_g numeric(6,1),
  carbs_g numeric(6,1),
  fat_g numeric(6,1),
  quantity numeric(5,2) not null default 1,
  fdc_id text,
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.food_logs enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create index food_logs_user_date_idx on public.food_logs (user_id, logged_date);
