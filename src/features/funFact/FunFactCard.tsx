import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function FunFactCard() {
  const [data, setData] = useState<{ fact: string; source: string | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ fact: string; source: string | null }>('/fun-fact')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {data && (
        <div>
          <p className="text-sm text-rdp-text">{data.fact}</p>
          {data.source && (
            <a href={data.source} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-rdp-signal">
              Source
            </a>
          )}
        </div>
      )}
    </div>
  )
}
