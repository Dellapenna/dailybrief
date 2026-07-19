import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'

type Game = { id: string; team: string; matchup: string; date: string; time: string | null; league: string }

/**
 * Merges each favorite team's upcoming schedule (already fetched for the
 * Sports card via TheSportsDB) into the same shape as synced calendar
 * events, so they can display alongside iCloud events in the Calendar
 * view — display-only, never written to calendar_events in the
 * database. Simpler than a real ICS subscription and avoids depending on
 * whether individual teams/leagues even publish one.
 */
export function useSportsAsEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ games: Game[] }>('/sports')
      .then((res) => {
        const mapped: CalendarEvent[] = res.games.map((g) => {
          const startsAt = g.time ? `${g.date}T${g.time}` : `${g.date}T00:00:00`
          return {
            id: `sports-${g.id}`,
            provider: 'sports',
            title: `${g.matchup} (${g.league})`,
            location: null,
            starts_at: new Date(startsAt).toISOString(),
            ends_at: null,
            all_day: !g.time,
          }
        })
        setEvents(mapped)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load sports schedule'))
  }, [])

  return { sportsEvents: events, error }
}
