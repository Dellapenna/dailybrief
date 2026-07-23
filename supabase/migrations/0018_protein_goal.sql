-- 0018_protein_goal.sql
-- Daily protein goal, same pattern as daily_calorie_goal. Protein grams
-- were already being captured on food_logs (from search/barcode/photo
-- estimate) but never aggregated or surfaced anywhere in the UI.

alter table public.user_preferences
  add column daily_protein_goal integer;
