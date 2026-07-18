import { useEffect, useState } from 'react'

/**
 * The one signature element this design is built around — a persistent
 * instrument-panel readout, styled after flight-deck/telemetry status
 * bars rather than a generic app header. Deliberately quiet everywhere
 * else so this carries the "tech" identity on its own.
 */
export default function StatusStrip() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const date = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex items-center justify-between border-b border-rdp-line bg-rdp-void px-4 py-1.5 font-mono text-[11px] text-rdp-text-dim">
      <div className="flex items-center gap-1.5">
        <span className="rdp-status-dot inline-block h-1.5 w-1.5 rounded-full bg-rdp-good" />
        <span>NOMINAL</span>
      </div>
      <div className="tabular-mono">
        {date} · {time}
      </div>
    </div>
  )
}
