import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/sports
 *
 * Real upcoming games AND recent final scores via TheSportsDB, using
 * their publicly documented free test API key ("3") — no signup needed,
 * but it's a shared/rate-limited demo key, not a private one. If this
 * gets flaky under real use, get a personal key at
 * thesportsdb.com/api.php and set SPORTS_DATA_API_KEY (already reserved
 * in .env.example) to swap it in.
 *
 * Only final/completed scores (via eventslast.php) — true live,
 * in-progress scoring isn't reliably available on the free tier of most
 * sports data providers, TheSportsDB included. Confirmed not needed per
 * the person's own call, so not pursued.
 *
 * v1 assumption: hardcoded favorite teams (Philadelphia Eagles/Phillies/
 * 76ers/Flyers) rather than reading from a preferences table — the brief
 * calls for configurable favorite teams eventually; not built yet.
 */

const API_KEY = process.env.SPORTS_DATA_API_KEY || '3'
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`

const FAVORITE_TEAMS = ['Philadelphia Eagles', 'Philadelphia Phillies', 'Philadelphia 76ers', 'Philadelphia Flyers']

let cache: { at: number; games: unknown[]; results: unknown[] } | null = null
const CACHE_MS = 30 * 60 * 1000

type Team = { idTeam: string; strTeam: string }
type UpcomingEvent = {
  idEvent: string
  strEvent: string
  dateEvent: string
  strTime: string | null
  strLeague: string
}
type CompletedEvent = {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  dateEvent: string
  strLeague: string
}

async function findTeam(teamName: string): Promise<Team | null> {
  const searchRes = await fetch(`${BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`)
  if (!searchRes.ok) return null
  const searchData = await searchRes.json()
  return searchData?.teams?.[0] ?? null
}

async function fetchUpcoming(teamName: string) {
  const team = await findTeam(teamName)
  if (!team) return []

  const eventsRes = await fetch(`${BASE}/eventsnext.php?id=${team.idTeam}`)
  if (!eventsRes.ok) return []
  const eventsData = await eventsRes.json()
  const events: UpcomingEvent[] = eventsData?.events ?? []

  return events.map((e) => ({
    id: e.idEvent,
    team: teamName,
    matchup: e.strEvent,
    date: e.dateEvent,
    time: e.strTime,
    league: e.strLeague,
  }))
}

async function fetchResults(teamName: string) {
  const team = await findTeam(teamName)
  if (!team) return []

  const eventsRes = await fetch(`${BASE}/eventslast.php?id=${team.idTeam}`)
  if (!eventsRes.ok) return []
  const eventsData = await eventsRes.json()
  const events: CompletedEvent[] = eventsData?.results ?? []

  return events
    .filter((e) => e.intHomeScore != null && e.intAwayScore != null)
    .map((e) => ({
      id: e.idEvent,
      team: teamName,
      matchup: e.strEvent,
      homeTeam: e.strHomeTeam,
      awayTeam: e.strAwayTeam,
      homeScore: e.intHomeScore,
      awayScore: e.intAwayScore,
      date: e.dateEvent,
      league: e.strLeague,
    }))
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ games: cache.games, results: cache.results, cached: true })
    }

    const [upcomingResults, finalResults] = await Promise.all([
      Promise.allSettled(FAVORITE_TEAMS.map(fetchUpcoming)),
      Promise.allSettled(FAVORITE_TEAMS.map(fetchResults)),
    ])

    const games = upcomingResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    games.sort((a, b) => a.date.localeCompare(b.date))

    const results = finalResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    results.sort((a, b) => b.date.localeCompare(a.date))

    cache = { at: Date.now(), games, results }
    return json({ games, results, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/sports',
}
