import { useHabits } from './useHabits'
import type { PillarId } from '@/types/pillar'

/**
 * For habits that get their own dedicated card UI instead of the generic
 * HabitRow list — Prayer, Gratitude, Service (Soul), Breathing Meditation
 * (Mind). Found by name since there's no stable ID to hardcode across
 * environments; seeded by migration.
 */
export function useHabitByName(pillar: PillarId, name: string) {
  const { habits, loading, toggleToday } = useHabits(pillar)
  const habit = habits.find((h) => h.name === name)
  return { habit, loading, toggleToday }
}
