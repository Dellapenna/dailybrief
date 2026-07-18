import { NavLink, Outlet } from 'react-router-dom'
import StatusStrip from '@/components/StatusStrip'

/**
 * Desktop sidebar — full route set per PRODUCT_BRIEF.md's suggested
 * desktop navigation. "Today", "Projects", and "Analytics" from the
 * brief's suggested list aren't separate routes yet (they land in
 * Phase 3 / Phase 6) — omitted here rather than linking to a page that
 * doesn't exist yet. Revisit once those routes exist.
 */
const desktopNav = [
  { to: '/mission-control', label: 'Mission Control' },
  { to: '/briefing', label: 'Morning Intelligence' },
  { to: '/goals', label: 'Goals' },
  { to: '/habits', label: 'Habits' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/ideas', label: 'Idea Vault' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/settings', label: 'Settings' },
]

/** Mobile bottom nav — the brief's fixed 5-slot set. */
const mobileNav = [
  { to: '/mission-control', label: 'Mission Control', short: 'Home' },
  { to: '/briefing', label: 'Briefing', short: 'Briefing' },
  { to: '/tasks', label: 'Plan', short: 'Plan' },
  { to: '/reviews', label: 'Progress', short: 'Progress' },
  { to: '/more', label: 'More', short: 'More' },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-rdp-void md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-rdp-line bg-rdp-panel md:flex">
        <div className="px-5 py-5">
          <p className="font-display text-sm font-semibold tracking-tight text-rdp-text">RDP 2.0</p>
          <p className="mt-0.5 text-[11px] text-rdp-text-faint">Build the man. Lead the life.</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-rdp-signal/15 font-medium text-rdp-signal'
                    : 'text-rdp-text-dim hover:bg-white/5 hover:text-rdp-text'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-rdp-line px-5 py-3">
          <p className="font-mono text-[10px] text-rdp-text-faint">PRIVATE INSTANCE</p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        <StatusStrip />

        {/* Mobile header (sidebar replaces this on desktop) */}
        <header className="border-b border-rdp-line px-5 py-3 md:hidden">
          <p className="font-display text-sm font-semibold tracking-tight text-rdp-text">RDP 2.0</p>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 flex border-t border-rdp-line bg-rdp-panel md:hidden">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-[11px] font-medium ${
                  isActive ? 'text-rdp-signal' : 'text-rdp-text-dim'
                }`
              }
            >
              {item.short}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
