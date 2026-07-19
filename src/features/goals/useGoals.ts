import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Goal } from '@/types/goal'
import type { PillarId } from '@/types/pillar'

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
    try {
      await api.patch(`/goals/${id}`, updates)
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
