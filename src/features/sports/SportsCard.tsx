import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Game = { id: string; team: string; matchup: string; date: string; time: string | null; league: string }
type Result = {
  id: string
  team: string
  matchup: string
  homeTeam: string
  awayTeam: string
  homeScore: string
  awayScore: string
  date: string
  league: string
}

export default function SportsCard() {
  const [games, setGames] = useState<Game[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ games: Game[]; results: Result[] }>('/sports')
      .then((res) => {
        setGames(res.games)
        setResults(res.results)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="text-center text-sm text-rdp-text-faint">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="text-sm text-rdp-risk">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-rdp-line bg-rdp-panel px-3">
        <p className="px-1 pt-2 font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
          Recent Results
        </p>
        {results.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No recent results found.</p>
        ) : (
          results.map((r) => {
            const home = Number(r.homeScore)
            const away = Number(r.awayScore)
            const homeWon = home > away
            const awayWon = away > home
            return (
              <div key={r.id} className="border-b border-rdp-line py-2.5 last:border-b-0">
                <div className="flex items-center justify-between text-sm">
                  <span className={homeWon ? 'font-semibold text-rdp-text' : 'text-rdp-text-dim'}>
                    {r.homeTeam}
                  </span>
                  <span className="font-mono tabular-nums text-rdp-text">{r.homeScore}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={awayWon ? 'font-semibold text-rdp-text' : 'text-rdp-text-dim'}>
                    {r.awayTeam}
                  </span>
                  <span className="font-mono tabular-nums text-rdp-text">{r.awayScore}</span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-rdp-text-faint">
                  {r.date} · {r.league}
                </p>
              </div>
            )
          })
        )}
      </div>

      <div className="rounded-xl border border-rdp-line bg-rdp-panel px-3">
        <p className="px-1 pt-2 font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
          Upcoming
        </p>
        {games.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No upcoming games found.</p>
        ) : (
          games.map((g) => (
            <div key={g.id} className="border-b border-rdp-line py-2.5 last:border-b-0">
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
