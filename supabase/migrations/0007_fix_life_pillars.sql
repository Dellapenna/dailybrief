-- 0007_fix_life_pillars.sql
-- Bug fix: life_pillars (seeded in 0001) still had the original taxonomy
-- (body, mind, family, career, builder, life) from before the pillar
-- rebuild in 0006's era — nobody updated it to match the new one
-- (body, mind, spirit, life, work, intelligence), so tasks/goals/habits
-- foreign keys reject 'spirit', 'work', and 'intelligence'. This
-- reconciles the reference table with what the app actually uses now.

insert into public.life_pillars (id, label, sort_order) values
  ('spirit', 'Spirit', 3),
  ('work', 'Work', 5),
  ('intelligence', 'Intelligence', 6)
on conflict (id) do nothing;

update public.life_pillars set label = 'Mind', sort_order = 2 where id = 'mind';
update public.life_pillars set label = 'Life', sort_order = 4 where id = 'life';
update public.life_pillars set label = 'Body', sort_order = 1 where id = 'body';

-- family/career/builder aren't part of the current taxonomy. Safe to
-- remove since nothing has referenced them yet (fresh install, no real
-- task/goal/habit data predating this rebuild).
delete from public.life_pillars where id in ('family', 'career', 'builder');
