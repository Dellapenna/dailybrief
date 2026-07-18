import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function DadJokePage() {
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
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Daily Dad Joke</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Laugh. Share. Make their day.</p>

      <div className="mt-6 rounded-xl border border-rdp-line bg-rdp-panel p-6">
        {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
        {error && <p className="text-sm text-rdp-risk">{error}</p>}
        {joke && <p className="text-lg text-rdp-text">{joke}</p>}
      </div>
    </div>
  )
}
