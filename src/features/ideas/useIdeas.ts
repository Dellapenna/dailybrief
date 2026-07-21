import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Idea, IdeaStatus } from '@/types/idea'

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export function useIdeas(status: IdeaStatus | 'all') {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = status === 'all' ? '' : `?status=${status}`
      const res = await api.get<{ ideas: Idea[] }>(`/ideas${query}`)
      setIdeas(res.ideas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    reload()
  }, [reload])

  async function createIdea(title: string) {
    try {
      await api.post('/ideas', { title })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea')
    }
  }

  async function updateIdea(id: string, updates: Partial<Idea>) {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
    const apiBody: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      apiBody[toCamelCase(key)] = value
    }
    try {
      await api.patch(`/ideas/${id}`, apiBody)
      if (updates.status && status !== 'all' && updates.status !== status) {
        setIdeas((prev) => prev.filter((i) => i.id !== id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update idea')
      reload()
    }
  }

  async function deleteIdea(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
    try {
      await api.delete(`/ideas/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete idea')
      reload()
    }
  }

  return { ideas, loading, error, createIdea, updateIdea, deleteIdea }
}
