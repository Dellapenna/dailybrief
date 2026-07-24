-- 0020_idea_notes.sql
-- Separate "notes" field for ongoing reflection on an idea over time —
-- distinct from description (what the idea IS) vs. notes (your evolving
-- thinking about it as you keep coming back to it).

alter table public.ideas
  add column notes text;
