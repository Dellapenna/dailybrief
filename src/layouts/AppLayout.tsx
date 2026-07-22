import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import StatusStrip from '@/components/StatusStrip'

/**
 * Full nav list — used for the desktop sidebar AND the mobile hamburger
 * drawer, so both surfaces show the same comprehensive set rather than
 * mobile being limited to whatever fits in a handful of bottom-tab
 * slots. Replaced the old fixed-bottom-nav + separate "More" page
 * pattern per direct request — a drawer can just show everything
 * directly instead of needing an overflow page.
 */
const navSections: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: 'Hubs',
    items: [
      { to: '/mission-control', label: 'Mission Control' },
      { to: '/daily-dashboard', label: 'Daily Dashboard' },
    ],
  },
  {
    label: 'More',
    items: [
      { to: '/tasks', label: 'All Tasks' },
      { to: '/goals', label: 'All Goals' },
      { to: '/habits', label: 'All Habits' },
      { to: '/ideas', label: 'Idea Vault' },
      { to: '/reviews', label: 'Reviews' },
      { to: '/calories', label: 'Calorie Counter' },
      { to: '/settings', label: 'Settings' },
    ],
  },
]

const flatNav = navSections.flatMap((s) => s.items)

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-rdp-void md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-rdp-line bg-rdp-panel md:flex">
        <div className="px-5 py-5">
          <p className="font-display text-sm font-semibold tracking-tight text-rdp-text">RDP 2.0</p>
          <p className="mt-0.5 text-[11px] text-rdp-text-faint">Build the man. Lead the life.</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {flatNav.map((item) => (
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

        {/* Mobile header with hamburger trigger (sidebar replaces this on desktop) */}
        <header className="flex items-center justify-between border-b border-rdp-line px-5 py-3 md:hidden">
          <p className="font-display text-sm font-semibold tracking-tight text-rdp-text">RDP 2.0</p>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-rdp-text hover:bg-rdp-panel"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile hamburger drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div
            className="absolute inset-y-0 right-0 flex w-72 flex-col overflow-y-auto border-l border-rdp-line bg-rdp-panel"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <p className="font-display text-sm font-semibold tracking-tight text-rdp-text">RDP 2.0</p>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-rdp-text hover:bg-rdp-void"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {navSections.map((section) => (
              <div key={section.label} className="px-3 py-2">
                <p className="px-2 font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">
                  {section.label}
                </p>
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-rdp-signal/15 font-medium text-rdp-signal'
                            : 'text-rdp-text-dim hover:bg-white/5 hover:text-rdp-text'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
