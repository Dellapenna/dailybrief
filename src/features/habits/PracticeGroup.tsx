import { useState, type ReactNode } from 'react'
import type { PillarId } from '@/types/pillar'

/**
 * One collapsible, pillar-colored group containing several related
 * Practices. Each Practice inside is its own distinctly-bordered,
 * individually collapsible card (PracticeSubItem) — per feedback that
 * items within a group weren't visually separated enough, sharing the
 * group's background made them blend together. Now each one stands
 * apart with its own border/background, closed by default.
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

export function PracticeSubItem({
  label,
  defaultOpen = false,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-lg border border-rdp-line bg-rdp-void">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
        <p className="text-sm font-medium text-rdp-text">{label}</p>
        <span className={`shrink-0 font-mono text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && <div className="border-t border-rdp-line p-3">{children}</div>}
    </div>
  )
}

export default function PracticeGroup({
  pillar,
  defaultOpen = false,
  children,
}: {
  pillar: PillarId
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const style = PILLAR_STYLES[pillar]

  return (
    <div className={`overflow-hidden rounded-xl border border-l-4 border-rdp-line ${style.border} bg-rdp-panel`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 p-4 text-left">
        <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${style.badge}`}>
          {PILLAR_NAMES[pillar]}
        </span>
        <span className={`shrink-0 font-mono text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && <div className="space-y-2.5 border-t border-rdp-line p-4">{children}</div>}
    </div>
  )
}
