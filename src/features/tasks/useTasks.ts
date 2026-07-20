import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Task, TaskStatus } from '@/types/task'
import type { PillarId } from '@/types/pillar'

export type TaskView = 'today' | TaskStatus

export function useTasks(view: TaskView, pillar?: PillarId) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = pillar ? `/tasks?view=${view}&pillar=${pillar}` : `/tasks?view=${view}`
      const res = await api.get<{ tasks: Task[] }>(query)
      setTasks(res.tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [view, pillar])

  useEffect(() => {
    reload()
  }, [reload])

  async function createTask(title: string, defaults?: Partial<Task>) {
    const status = view === 'today' ? 'today' : (view as TaskStatus)
    const optimistic: Task = {
      id: `temp-${Date.now()}`,
      user_id: '',
      title,
      notes: null,
      pillar_id: pillar ?? null,
      project: null,
      status,
      flagged: false,
      due_date: null,
      completed_at: null,
      source: 'manual',
      sort_order: 0,
      recurrence: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...defaults,
    }
    setTasks((prev) => [optimistic, ...prev])
    try {
      await api.post('/tasks', { title, status, pillarId: pillar ?? null, ...defaults })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      reload()
    }
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    try {
      await api.patch(`/tasks/${id}`, updates)
      // Completing/moving a task usually means it should leave this view.
      if (updates.status && updates.status !== view) {
        setTasks((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      reload()
    }
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await api.delete(`/tasks/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      reload()
    }
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, reload }
}
