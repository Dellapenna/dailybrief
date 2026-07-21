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

    // Bug fix: this used to pass `updates` straight through to the API,
    // but the API expects camelCase field names (dueDate, pillarId,
    // sortOrder) while Task's own fields are snake_case (due_date,
    // pillar_id, sort_order) to match the database columns. Sending
    // `due_date` where the backend looks for `dueDate` meant the request
    // succeeded but silently changed nothing — a manual due-date edit
    // would appear to work, then revert on the next reload.
    const apiBody: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      const apiKey = key === 'due_date' ? 'dueDate' : key === 'pillar_id' ? 'pillarId' : key === 'sort_order' ? 'sortOrder' : key
      apiBody[apiKey] = value
    }

    try {
      await api.patch(`/tasks/${id}`, apiBody)
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

  async function moveTask(id: string, direction: 'up' | 'down') {
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= tasks.length) return

    const reordered = [...tasks]
    ;[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]]

    // Renumber the whole visible list sequentially — simpler and more
    // robust than swapping raw sort_order values, which may all still
    // be the same default (0) if nothing's been reordered before.
    const renumbered = reordered.map((t, i) => ({ ...t, sort_order: i }))
    setTasks(renumbered)

    try {
      const changed = renumbered.filter((t) => {
        const original = tasks.find((orig) => orig.id === t.id)
        return !original || original.sort_order !== t.sort_order
      })
      await Promise.all(changed.map((t) => api.patch(`/tasks/${t.id}`, { sortOrder: t.sort_order })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks')
      reload()
    }
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, moveTask, reload }
}
