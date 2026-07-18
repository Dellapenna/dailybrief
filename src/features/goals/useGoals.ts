import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Goal } from '@/types/goal'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ goals: Goal[] }>('/goals')
      setGoals(res.goals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function createGoal(title: string) {
    try {
      await api.post('/goals', { title })
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
