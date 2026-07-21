import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Goal } from '@/types/goal'
import type { PillarId } from '@/types/pillar'

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export function useGoals(pillar?: PillarId) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = pillar ? `/goals?pillar=${pillar}` : '/goals'
      const res = await api.get<{ goals: Goal[] }>(query)
      setGoals(res.goals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals')
    } finally {
      setLoading(false)
    }
  }, [pillar])

  useEffect(() => {
    reload()
  }, [reload])

  async function createGoal(title: string) {
    try {
      await api.post('/goals', { title, pillarId: pillar ?? null })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal')
    }
  }

  async function updateGoal(id: string, updates: Partial<Goal>) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))

    // Bug fix: this used to pass `updates` straight through, but the API
    // expects camelCase field names (whyItMatters, nextAction, targetDate,
    // pillarId, etc.) while Goal's own fields are snake_case to match the
    // database columns. Several edits — Why it matters, Next action,
    // Target date, and pillar assignment — were silently not saving as a
    // result (same root cause as the earlier Tasks due-date bug).
    const apiBody: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      apiBody[toCamelCase(key)] = value
    }

    try {
      await api.patch(`/goals/${id}`, apiBody)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal')
      reload()
    }
  }

  async function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    try {
      await api.delete(`/goals/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal')
      reload()
    }
  }

  return { goals, loading, error, createGoal, updateGoal, deleteGoal }
}
