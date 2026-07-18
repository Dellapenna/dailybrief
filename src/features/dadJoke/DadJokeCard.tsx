import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function DadJokeCard() {
  const [joke, setJoke] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ joke: string }>('/dad-joke')
      .then((res) => setJoke(res.joke))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {joke && <p className="text-sm text-rdp-text">{joke}</p>}
    </div>
  )
}
