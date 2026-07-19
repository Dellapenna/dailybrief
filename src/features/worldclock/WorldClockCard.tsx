import { useEffect, useState } from 'react'

const ZONES = [
  { label: 'Spain', tz: 'Europe/Madrid' },
  { label: 'Guatemala', tz: 'America/Guatemala' },
  { label: 'Austin', tz: 'America/Chicago' },
]

/**
 * Pure client-side — just timezone conversion, no backend needed at all.
 */
export default function WorldClockCard() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-2">
      {ZONES.map((z) => (
        <div key={z.tz} className="flex items-center justify-between">
          <span className="text-sm text-rdp-text">{z.label}</span>
          <span className="font-mono text-sm tabular-nums text-rdp-text-dim">
            {now.toLocaleTimeString(undefined, { timeZone: z.tz, hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  )
}
