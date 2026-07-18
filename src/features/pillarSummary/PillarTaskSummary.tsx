import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { PILLAR_LABELS, type PillarId } from '@/types/pillar'

const PILLAR_ROUTES: Record<PillarId, string> = {
  body: '/body',
  mind: '/mind',
  spirit: '/spirit',
  life: '/life',
  work: '/work',
  intelligence: '/intelligence',
}

export default function PillarTaskSummary() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ counts: Record<string, number> }>('/tasks/summary')
      .then((res) => setCounts(res.counts))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  const pillars = Object.keys(PILLAR_LABELS) as PillarId[]
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        To-Do by Pillar
      </p>
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}
      {!counts && !error && <p className="mt-2 text-sm text-rdp-text-faint">Loading…</p>}
      {counts && (
        <div className="mt-2 space-y-1.5">
          {pillars.map((p) => (
            <Link key={p} to={PILLAR_ROUTES[p]} className="flex items-center justify-between text-sm hover:text-rdp-signal">
              <span className="text-rdp-text">{PILLAR_LABELS[p]}</span>
              <span className="font-mono tabular-nums text-rdp-amber">{counts[p] ?? 0}</span>
            </Link>
          ))}
          {counts.none > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-rdp-text-faint">Unassigned</span>
              <span className="font-mono tabular-nums text-rdp-text-faint">{counts.none}</span>
            </div>
          )}
          <div className="mt-2 border-t border-rdp-line pt-2 flex items-center justify-between text-sm font-medium">
            <span className="text-rdp-text">Total</span>
            <span className="font-mono tabular-nums text-rdp-text">{total}</span>
          </div>
        </div>
      )}
    </div>
  )
}
