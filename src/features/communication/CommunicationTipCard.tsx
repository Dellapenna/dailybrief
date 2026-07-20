import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function CommunicationTipCard() {
  const [tip, setTip] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ tip: string }>('/communication-tip')
      .then((res) => setTip(res.tip))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {tip && <p className="text-sm text-rdp-text">{tip}</p>}
    </div>
  )
}
