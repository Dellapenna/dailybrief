import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}
function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

/**
 * Month grid view — visual language borrowed from the reference "calendar
 * skin" image (dark panel, gold framing, teal grid lines, compass mark)
 * rather than embedding that image directly, since it's a UI mockup, not
 * a decorative photo — a real functional grid needed to replace it, not
 * sit behind it. Shows real synced events (dots per day, from the same
 * calendar_events cache TodayEvents reads) — no fabricated data.
 */
export default function MonthView() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor])
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor])

  const gridStart = useMemo(() => {
    const d = new Date(monthStart)
    d.setDate(d.getDate() - d.getDay())
    return d
  }, [monthStart])

  const gridDays = useMemo(() => {
    const days: Date[] = []
    const cursor2 = new Date(gridStart)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(cursor2))
      cursor2.setDate(cursor2.getDate() + 1)
    }
    return days
  }, [gridStart])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const rangeEnd = new Date(monthEnd)
    rangeEnd.setDate(rangeEnd.getDate() + 1)
    api
      .get<{ events: CalendarEvent[] }>(
        `/calendar/events?start=${toDateKey(gridStart)}&end=${toDateKey(rangeEnd)}`,
      )
      .then((res) => setEvents(res.events))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load month'))
      .finally(() => setLoading(false))
  }, [gridStart, monthEnd])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const key = e.starts_at.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return map
  }, [events])

  const today = toDateKey(new Date())

  return (
    <div className="rounded-xl border border-rdp-line-bright bg-rdp-panel p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          className="rounded-lg px-2 py-1 text-rdp-text-dim hover:text-rdp-signal"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-display text-sm font-semibold tracking-wide text-rdp-amber">
          {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase()}
        </p>
        <button
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          className="rounded-lg px-2 py-1 text-rdp-text-dim hover:text-rdp-signal"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-3 grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-rdp-line bg-rdp-line">
        {dayLabels.map((d) => (
          <div key={d} className="bg-rdp-void py-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-rdp-text-faint">
            {d}
          </div>
        ))}
        {gridDays.map((day) => {
          const key = toDateKey(day)
          const inMonth = day.getMonth() === cursor.getMonth()
          const dayEvents = eventsByDay.get(key) ?? []
          const isToday = key === today
          return (
            <div
              key={key}
              className={`min-h-16 bg-rdp-void p-1.5 ${inMonth ? '' : 'opacity-30'}`}
            >
              <span
                className={`font-mono text-xs ${
                  isToday
                    ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-rdp-signal text-rdp-void'
                    : 'text-rdp-text-dim'
                }`}
              >
                {day.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((e) => (
                  <p key={e.id} className="truncate text-[10px] text-rdp-amber">
                    {e.title}
                  </p>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-rdp-text-faint">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {loading && <p className="mt-2 text-xs text-rdp-text-faint">Loading…</p>}
    </div>
  )
}
