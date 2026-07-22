import { NavLink } from 'react-router-dom'

/**
 * Back in the primary mobile flow — bottom nav is 5 tabs (Daily
 * Dashboard/Calorie Counter/Plan/Habits & Logbook/More) plus this for
 * everything else, per direct request. Mission Control moved in here;
 * Tasks and Habits & Logbook moved out to direct tabs.
 */
const otherLinks = [
  { to: '/mission-control', label: 'Mission Control' },
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
