import type { ReactNode } from 'react'
import type { PillarId } from '@/types/pillar'

/**
 * Individually color-coded card for each Practice item (Exercise Log,
 * Prayer, Communication Journal, etc.) — replaces the earlier tabbed-
 * by-pillar layout, which grouped several unrelated practices together
 * inside one shared tab. Each practice now gets its own clearly
 * separated card with a pillar-colored left border and badge, so it's
 * immediately visible which pillar it belongs to without needing to
 * open a tab first.
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
  children,
}: {
  pillar: PillarId
  title: string
  children: ReactNode
}) {
  const style = PILLAR_STYLES[pillar]
  return (
    <div className={`rounded-xl border border-l-4 border-rdp-line ${style.border} bg-rdp-panel p-4`}>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${style.badge}`}>
          {PILLAR_NAMES[pillar]}
        </span>
        <p className="font-display text-sm font-semibold text-rdp-text">{title}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
