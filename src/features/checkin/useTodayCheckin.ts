import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { MorningCheckin } from '@/types/checkin'

export function useTodayCheckin() {
  const [checkin, setCheckin] = useState<MorningCheckin>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get<{ checkin: MorningCheckin }>('/checkin')
      .then((res) => setCheckin(res.checkin))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load check-in'))
      .finally(() => setLoading(false))
  }, [])

  async function save(updates: Partial<NonNullable<MorningCheckin>>) {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.patch<{ checkin: MorningCheckin }>('/checkin', updates)
      setCheckin(res.checkin)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save check-in')
    } finally {
      setSaving(false)
    }
  }

  return { checkin, loading, saving, saved, error, save }
}
