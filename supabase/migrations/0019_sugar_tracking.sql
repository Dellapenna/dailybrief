-- 0019_sugar_tracking.sql
-- Sugar tracking, same shape as protein. Framed as a daily LIMIT rather
-- than a goal — unlike protein/calories where hitting or exceeding the
-- number is fine or the point, sugar is something most people want to
-- stay under, so the UI treats it that way (different color, "limit"
-- language) rather than reusing the protein progress-bar framing as-is.

alter table public.food_logs
  add column sugar_g numeric(6,1);

alter table public.user_preferences
  add column daily_sugar_limit integer;
