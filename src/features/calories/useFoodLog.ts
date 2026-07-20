import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { FoodLogEntry, Meal } from '@/types/foodLog'

export function useFoodLog() {
  const [logs, setLogs] = useState<FoodLogEntry[]>([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ logs: FoodLogEntry[]; totalCalories: number; dailyCalorieGoal: number | null }>(
        '/food-log',
      )
      setLogs(res.logs)
      setTotalCalories(res.totalCalories)
      setDailyCalorieGoal(res.dailyCalorieGoal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food log')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addEntry(entry: {
    foodName: string
    calories: number
    meal: Meal
    quantity?: number
    proteinG?: number | null
    carbsG?: number | null
    fatG?: number | null
    fdcId?: string | null
  }) {
    try {
      await api.post('/food-log', entry)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log food')
    }
  }

  async function deleteEntry(id: string) {
    setLogs((prev) => prev.filter((l) => l.id !== id))
    try {
      await api.delete(`/food-log/${id}`)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
      reload()
    }
  }

  return { logs, totalCalories, dailyCalorieGoal, loading, error, addEntry, deleteEntry }
}
