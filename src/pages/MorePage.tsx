import { NavLink } from 'react-router-dom'

/**
 * No longer part of the primary nav flow — all 6 real destinations are
 * direct bottom-nav tabs now (see AppLayout), no overflow needed. Kept,
 * unused, in case useful again later.
 */
const otherLinks = [
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
