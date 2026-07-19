import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { CalendarEvent, CalendarConnection } from '@/types/calendar'
import { useSportsAsEvents } from './useSportsAsEvents'

export default function TodayEvents({ days = 1 }: { days?: number }) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [connections, setConnections] = useState<CalendarConnection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { sportsEvents } = useSportsAsEvents()

  useEffect(() => {
    api
      .get<{ events: CalendarEvent[]; connections: CalendarConnection[] }>(`/calendar/events?days=${days}`)
      .then((res) => {
        setEvents(res.events)
        setConnections(res.connections)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load calendar'))
      .finally(() => setLoading(false))
  }, [days])

  const rangeEnd = new Date()
  rangeEnd.setDate(rangeEnd.getDate() + days)
  const sportsInRange = sportsEvents.filter((e) => new Date(e.starts_at) < rangeEnd)
  const allEvents = [...events, ...sportsInRange].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  )

  const anyConnected = connections.some((c) => c.status === 'connected')

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        {days <= 1 ? "Today's Calendar" : 'Upcoming'}
      </p>

      {loading && <p className="mt-2 text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      {!loading && !error && !anyConnected && sportsInRange.length === 0 && (
        <p className="mt-2 text-sm text-rdp-text-dim">
          No calendar connected yet — connect one in Settings.
        </p>
      )}

      {!loading && !error && (anyConnected || sportsInRange.length > 0) && allEvents.length === 0 && (
        <p className="mt-2 text-sm text-rdp-text-dim">Nothing on the calendar.</p>
      )}

      {allEvents.length > 0 && (
        <ul className="mt-2 space-y-2">
          {allEvents.map((event) => (
            <li key={event.id} className="text-sm">
              <span className="font-mono text-xs font-medium tabular-nums text-rdp-text">
                {event.all_day
                  ? 'All day'
                  : new Date(event.starts_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </span>{' '}
              <span className="text-rdp-text-dim">{event.title}</span>
              {event.location && <span className="text-rdp-text-faint"> · {event.location}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
