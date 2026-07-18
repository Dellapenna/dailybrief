import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { EveningReview } from '@/types/eveningReview'

export function useTodayReview() {
  const [review, setReview] = useState<EveningReview>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get<{ review: EveningReview }>('/evening-review')
      .then((res) => setReview(res.review))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load review'))
      .finally(() => setLoading(false))
  }, [])

  async function save(updates: Partial<NonNullable<EveningReview>>) {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.patch<{ review: EveningReview }>('/evening-review', updates)
      setReview(res.review)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  return { review, loading, saving, saved, error, save }
}
