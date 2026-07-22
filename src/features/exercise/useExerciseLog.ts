import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { ExerciseLog, ExerciseCategory } from '@/types/exercise'

export function useExerciseLog() {
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ logs: ExerciseLog[] }>('/exercise-log?limit=20')
      setLogs(res.logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercise log')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addLog(entry: {
    category: ExerciseCategory
    activity: string
    durationMinutes?: number
    caloriesBurned?: number
    notes?: string
  }) {
    try {
      await api.post('/exercise-log', entry)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log exercise')
    }
  }

  async function deleteLog(id: string) {
    setLogs((prev) => prev.filter((l) => l.id !== id))
    try {
      await api.delete(`/exercise-log/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      reload()
    }
  }

  return { logs, loading, error, addLog, deleteLog }
}
