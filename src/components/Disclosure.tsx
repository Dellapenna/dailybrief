import { useState, type ReactNode, type ComponentType } from 'react'

/**
 * Collapsible section — the "dropdown" building block used across
 * Settings and anywhere else content needs to stay compact. Each
 * instance manages its own open state independently (multiple can be
 * open at once), which suits a settings-style page better than a strict
 * one-at-a-time accordion.
 */
export default function Disclosure({
  title,
  subtitle,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle?: string
  icon?: ComponentType<{ className?: string }>
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-rdp-signal" />}
          <div>
            <p className="font-display text-sm font-semibold text-rdp-text">{title}</p>
            {subtitle && <p className="mt-0.5 text-xs text-rdp-text-dim">{subtitle}</p>}
          </div>
        </div>
        <span
          className={`shrink-0 font-mono text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-rdp-line px-4 py-4">{children}</div>}
    </div>
  )
}
