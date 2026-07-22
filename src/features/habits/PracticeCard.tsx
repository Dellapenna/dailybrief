import { useState, type ReactNode } from 'react'
import type { PillarId } from '@/types/pillar'

/**
 * Individually color-coded, collapsible card for each Practice item
 * (Exercise Log, Prayer, Communication Journal, etc.). Collapsible —
 * not always fully expanded — per direct feedback that 8 always-open
 * cards stacked on one page felt cluttered; now it's 8 compact colored
 * headers by default, expanding only the one you actually tap into.
 */
const PILLAR_STYLES: Record<PillarId, { border: string; badge: string }> = {
  body: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400' },
  mind: { border: 'border-l-sky-500', badge: 'bg-sky-500/15 text-sky-400' },
  soul: { border: 'border-l-purple-500', badge: 'bg-purple-500/15 text-purple-400' },
}

const PILLAR_NAMES: Record<PillarId, string> = {
  body: 'Body',
  mind: 'Mind',
  soul: 'Soul',
}

export default function PracticeCard({
  pillar,
  title,
  defaultOpen = false,
  children,
}: {
  pillar: PillarId
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const style = PILLAR_STYLES[pillar]

  return (
    <div className={`overflow-hidden rounded-xl border border-l-4 border-rdp-line ${style.border} bg-rdp-panel`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 p-4 text-left">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${style.badge}`}>
            {PILLAR_NAMES[pillar]}
          </span>
          <p className="font-display text-sm font-semibold text-rdp-text">{title}</p>
        </div>
        <span className={`shrink-0 font-mono text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && <div className="border-t border-rdp-line p-4">{children}</div>}
    </div>
  )
}
