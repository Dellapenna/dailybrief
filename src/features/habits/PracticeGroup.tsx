import { useState, type ReactNode } from 'react'
import type { PillarId } from '@/types/pillar'

/**
 * Pillar-colored section for related Practices. The group itself is a
 * static header now, not another collapsible layer — per direct
 * feedback that group-then-item was 2 taps to reach anything. Now it's
 * 1: the pillar badge is just a visual divider, each Practice inside
 * (PracticeSubItem) is the only thing that expands.
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

export default function PracticeGroup({ pillar, children }: { pillar: PillarId; children: ReactNode }) {
  const style = PILLAR_STYLES[pillar]

  return (
    <div className={`rounded-xl border border-l-4 border-rdp-line ${style.border} bg-rdp-panel p-4`}>
      <span className={`inline-block rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${style.badge}`}>
        {PILLAR_NAMES[pillar]}
      </span>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  )
}
