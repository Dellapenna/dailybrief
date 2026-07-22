import { NavLink } from 'react-router-dom'

/**
 * No longer part of the primary nav flow — the hamburger drawer covers
 * this ground directly now (see AppLayout). Kept, unused, in case still
 * useful as a fallback.
 */
const otherLinks = [
  { to: '/goals', label: 'All Goals' },
  { to: '/habits', label: 'All Habits' },
  { to: '/ideas', label: 'Idea Vault' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/calories', label: 'Calorie Counter' },
  { to: '/settings', label: 'Settings' },
]

export default function MorePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">More</h1>

      <nav className="mt-4 divide-y divide-rdp-line rounded-xl border border-rdp-line bg-rdp-panel">
        {otherLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="block px-4 py-3 text-sm text-rdp-text hover:bg-rdp-void">
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
