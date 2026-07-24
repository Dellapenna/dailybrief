import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Habit } from '@/types/habit'
import type { PillarId } from '@/types/pillar'

export function useHabits(pillar?: PillarId) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = pillar ? `/habits?pillar=${pillar}` : '/habits'
      const res = await api.get<{ habits: Habit[] }>(query)
      setHabits(res.habits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [pillar])

  useEffect(() => {
    reload()
  }, [reload])

  async function createHabit(name: string) {
    try {
      await api.post('/habits', { name, pillarId: pillar ?? null })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
    }
  }

  async function toggleToday(habit: Habit) {
    // Optimistic: flip completedToday and nudge the streak by one in
    // either direction. Reload afterwards to get the real recomputed
    // values rather than trust this approximation long-term.
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              completedToday: !h.completedToday,
              currentStreak: h.completedToday ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1,
            }
          : h,
      ),
    )
    try {
      await api.post(`/habits/${habit.id}/toggle`)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit')
      reload()
    }
  }

  /**
   * Marks (or unmarks) yesterday specifically — for catching up on
   * something forgotten. The toggle endpoint accepts any date via
   * ?date=, this just wires the one-day-back case up as a dedicated
   * action since that's by far the most common "I forgot" case.
   */
  async function toggleYesterday(habit: Habit) {
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, completedYesterday: !h.completedYesterday } : h)))
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().slice(0, 10)
      await api.post(`/habits/${habit.id}/toggle?date=${dateStr}`)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit')
      reload()
    }
  }

  async function updateHabit(id: string, updates: Partial<Pick<Habit, 'name' | 'pillar_id'>>) {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))
    try {
      await api.patch(`/habits/${id}`, {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.pillar_id !== undefined ? { pillarId: updates.pillar_id } : {}),
      })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit')
      reload()
    }
  }

  async function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    try {
      await api.delete(`/habits/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit')
      reload()
    }
  }

  return { habits, loading, error, createHabit, toggleToday, toggleYesterday, updateHabit, deleteHabit }
}
