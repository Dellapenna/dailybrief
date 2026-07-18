import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Game = { id: string; team: string; matchup: string; date: string; time: string | null; league: string }

export default function SportsPage() {
  const [games, setGames] = useState<Game[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ games: Game[] }>('/sports')
      .then((res) => setGames(res.games))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Sports</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">
        Stay updated. Never miss a play. (Eagles, Phillies, 76ers, Flyers — configurable teams coming later.)
      </p>

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : games.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">No upcoming games found.</p>
        ) : (
          games.map((g) => (
            <div key={g.id} className="border-b border-rdp-line py-3 last:border-b-0">
              <p className="text-sm text-rdp-text">{g.matchup}</p>
              <p className="mt-0.5 font-mono text-xs text-rdp-text-faint">
                {g.date} {g.time ? `· ${g.time}` : ''} · {g.league}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
