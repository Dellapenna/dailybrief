import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/sports
 *
 * Real upcoming games via TheSportsDB, using their publicly documented
 * free test API key ("3") — no signup needed, but it's a shared/rate-
 * limited demo key, not a private one. If this gets flaky under real use,
 * get a personal key at thesportsdb.com/api.php and set
 * SPORTS_DATA_API_KEY (already reserved in .env.example) to swap it in.
 *
 * v1 assumption: hardcoded favorite teams (Philadelphia Eagles/Phillies/
 * 76ers/Flyers) rather than reading from a preferences table — the brief
 * calls for configurable favorite teams eventually; not built yet.
 */

const API_KEY = process.env.SPORTS_DATA_API_KEY || '3'
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`

const FAVORITE_TEAMS = ['Philadelphia Eagles', 'Philadelphia Phillies', 'Philadelphia 76ers', 'Philadelphia Flyers']

let cache: { at: number; games: unknown[] } | null = null
const CACHE_MS = 30 * 60 * 1000

type Team = { idTeam: string; strTeam: string }
type Event = {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  dateEvent: string
  strTime: string | null
  strLeague: string
}

async function fetchTeamEvents(teamName: string) {
  const searchRes = await fetch(`${BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`)
  if (!searchRes.ok) return []
  const searchData = await searchRes.json()
  const team: Team | undefined = searchData?.teams?.[0]
  if (!team) return []

  const eventsRes = await fetch(`${BASE}/eventsnext.php?id=${team.idTeam}`)
  if (!eventsRes.ok) return []
  const eventsData = await eventsRes.json()
  const events: Event[] = eventsData?.events ?? []

  return events.map((e) => ({
    id: e.idEvent,
    team: teamName,
    matchup: e.strEvent,
    date: e.dateEvent,
    time: e.strTime,
    league: e.strLeague,
  }))
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ games: cache.games, cached: true })
    }

    const results = await Promise.allSettled(FAVORITE_TEAMS.map(fetchTeamEvents))
    const games = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    games.sort((a, b) => a.date.localeCompare(b.date))

    cache = { at: Date.now(), games }
    return json({ games, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/sports',
}
