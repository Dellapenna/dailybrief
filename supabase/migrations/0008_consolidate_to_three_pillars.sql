-- 0008_consolidate_to_three_pillars.sql
-- Consolidates the 6-pillar taxonomy (body/mind/spirit/life/work/
-- intelligence) down to 3 real tags (body/mind/soul), with Mission
-- Control and Daily Dashboard becoming non-taggable hub pages instead of
-- pillars. Reflects a real product decision, not a bug fix — see the
-- conversation for the full "should we consolidate" discussion.

-- ─────────────────────────────────────────────────────────────────────────
-- Reconcile life_pillars: rename spirit -> soul, drop life/work/
-- intelligence as taggable pillars entirely.
-- ─────────────────────────────────────────────────────────────────────────
update public.life_pillars set id = 'soul', label = 'Soul', sort_order = 3 where id = 'spirit';

-- Remap any existing tagged data before removing the now-invalid pillar
-- rows (FK constraints would otherwise block the delete). No clean 1:1
-- mapping exists for life/work/intelligence under the new 3-pillar
-- model, so this untags rather than guessing wrong — nothing has much
-- real data yet, this is a design consolidation, not data loss.
update public.tasks set pillar_id = null where pillar_id in ('life', 'work', 'intelligence');
update public.goals set pillar_id = null where pillar_id in ('life', 'work', 'intelligence');
update public.habits set pillar_id = null where pillar_id in ('life', 'work', 'intelligence');

delete from public.life_pillars where id in ('life', 'work', 'intelligence');

-- ─────────────────────────────────────────────────────────────────────────
-- Move Breathing Meditation from Soul to Mind (per the new mapping —
-- the reference image puts "Meditate" under Mind, not Soul).
-- ─────────────────────────────────────────────────────────────────────────
update public.habits set pillar_id = 'mind' where name = 'Breathing Meditation' and pillar_id = 'soul';

-- ─────────────────────────────────────────────────────────────────────────
-- Seed Gratitude and Service as Soul-pillar habits, same pattern as
-- Prayer — real streak tracking via the existing habits system, found
-- by name in the frontend rather than a hardcoded ID.
-- ─────────────────────────────────────────────────────────────────────────
insert into public.habits (user_id, name, pillar_id, frequency, target)
select '11111111-1111-1111-1111-111111111111', 'Gratitude', 'soul', 'daily', 1
where not exists (select 1 from public.habits where name = 'Gratitude' and pillar_id = 'soul');

insert into public.habits (user_id, name, pillar_id, frequency, target)
select '11111111-1111-1111-1111-111111111111', 'Service', 'soul', 'daily', 1
where not exists (select 1 from public.habits where name = 'Service' and pillar_id = 'soul');
