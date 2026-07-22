import { NavLink } from 'react-router-dom'

/**
 * Back in the primary mobile flow — bottom nav is 4 direct tabs
 * (Mission Control/Daily Dashboard/Calorie Counter/More) plus this for
 * everything else, per direct request.
 */
const otherLinks = [
  { to: '/tasks', label: 'All Tasks' },
  { to: '/habits', label: 'Habits & Logbook' },
  { to: '/ideas', label: 'Idea Vault' },
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
