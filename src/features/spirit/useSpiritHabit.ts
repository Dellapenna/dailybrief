import { useHabits } from '@/features/habits/useHabits'

/**
 * Prayer and Breathing Meditation are seeded as ordinary Spirit-pillar
 * habits (migration 0006) so they get real streak tracking for free from
 * the existing habits/habit_entries system, rather than building
 * parallel tracking logic. Found by name since there's no stable ID to
 * hardcode across environments.
 */
export function useSpiritHabit(name: string) {
  const { habits, loading, toggleToday } = useHabits('spirit')
  const habit = habits.find((h) => h.name === name)
  return { habit, loading, toggleToday }
}
