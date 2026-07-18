import { NavLink } from 'react-router-dom'

/**
 * Mobile-only overflow menu. The brief's suggested mobile nav has 5 slots
 * (Mission Control / Briefing / Plan / Progress / More); everything that
 * doesn't fit those 5 lives here. Desktop shows all links directly in the
 * sidebar instead — see AppLayout.
 */
/**
 * Mobile-only overflow menu — everything that doesn't fit the 5 bottom
 * nav slots (Home / Mission Control / Plan / Progress / More). Desktop
 * shows the pillar pages directly in the sidebar instead — see
 * AppLayout — but the global All Tasks/Goals/Habits/Idea Vault/Reviews
 * views live here on both, since they're secondary to the per-pillar
 * versions now.
 */
const pillarLinks = [
  { to: '/body', label: 'Body' },
  { to: '/mind', label: 'Mind' },
  { to: '/spirit', label: 'Spirit' },
  { to: '/life', label: 'Life' },
  { to: '/work', label: 'Work' },
  { to: '/intelligence', label: 'Intelligence' },
]

const otherLinks = [
  { to: '/goals', label: 'All Goals' },
  { to: '/habits', label: 'All Habits' },
  { to: '/ideas', label: 'Idea Vault' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/settings', label: 'Settings' },
]

export default function MorePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">More</h1>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Pillars</p>
      <nav className="mt-2 divide-y divide-rdp-line rounded-xl border border-rdp-line bg-rdp-panel">
        {pillarLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="block px-4 py-3 text-sm text-rdp-text hover:bg-rdp-void">
            {link.label}
          </NavLink>
        ))}
      </nav>

      <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">More</p>
      <nav className="mt-2 divide-y divide-rdp-line rounded-xl border border-rdp-line bg-rdp-panel">
        {otherLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="block px-4 py-3 text-sm text-rdp-text hover:bg-rdp-void">
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
