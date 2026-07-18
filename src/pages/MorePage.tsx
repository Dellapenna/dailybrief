import { NavLink } from 'react-router-dom'

/**
 * Mobile-only overflow menu. The brief's suggested mobile nav has 5 slots
 * (Mission Control / Briefing / Plan / Progress / More); everything that
 * doesn't fit those 5 lives here. Desktop shows all links directly in the
 * sidebar instead — see AppLayout.
 */
const links = [
  { to: '/goals', label: 'Goals' },
  { to: '/habits', label: 'Habits' },
  { to: '/ideas', label: 'Idea Vault' },
  { to: '/settings', label: 'Settings' },
]

export default function MorePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">More</h1>
      <nav className="mt-6 divide-y divide-rdp-line rounded-xl border border-rdp-line bg-rdp-panel">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="block px-4 py-3 text-sm text-rdp-text hover:bg-rdp-void"
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
