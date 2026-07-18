import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function MotivationPage() {
  const [data, setData] = useState<{ quote: string; author: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ quote: string; author: string }>('/motivation')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Motivation Quote</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Daily fuel for your mind.</p>

      <div className="mt-6 rounded-xl border border-rdp-line bg-rdp-panel p-6">
        {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
        {error && <p className="text-sm text-rdp-risk">{error}</p>}
        {data && (
          <blockquote>
            <p className="font-display text-xl text-rdp-text">"{data.quote}"</p>
            <footer className="mt-3 text-sm text-rdp-amber">— {data.author}</footer>
          </blockquote>
        )}
      </div>
    </div>
  )
}
