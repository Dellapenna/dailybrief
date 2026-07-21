import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'

export default function MotivationCard() {
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
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <Skeleton lines={2} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {data && (
        <blockquote>
          <p className="font-display text-lg text-rdp-text">"{data.quote}"</p>
          <footer className="mt-2 text-sm text-rdp-amber">— {data.author}</footer>
        </blockquote>
      )}
    </div>
  )
}
