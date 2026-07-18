import { Link } from 'react-router-dom'

/**
 * The home / navigation hub — v3 of this page (see git history for v1/v2).
 * Rebuilt on request to work like the reference "Pick a Building" campus
 * picker: the actual map image is the canvas, with invisible tap zones
 * positioned over each labeled island, rather than a separate icon grid
 * below a hero banner.
 *
 * Hotspot rects are percentages of the image's own width/height (not
 * pixels), so they stay aligned regardless of screen size — the wrapper
 * div is position:relative with the image as a normal block child, so
 * the wrapper's height always matches the image's rendered height.
 *
 * Coordinates below are estimated by eye against the source image's
 * 3-row/5-column grid — close, not pixel-perfect. If a tap zone feels
 * off relative to its label once you see it live, tell me which one and
 * I'll nudge that specific rect.
 */
const ROWS = {
  row1: { top: 19, height: 19 }, // Calendar / Horoscope / Sports / News / To Do
  row2: { top: 38, height: 17 }, // Motivation / Word of Day / Fun Fact / Dad Joke / Goals
  row3: { top: 55, height: 17 }, // Progress / Habit Tracker / Today's Mission / Daily Briefing / Stock Market
}
const COLS = [
  { left: 0, width: 20 },
  { left: 20, width: 20 },
  { left: 40, width: 20 },
  { left: 60, width: 20 },
  { left: 80, width: 20 },
]

const tiles: { to: string; label: string; row: keyof typeof ROWS; col: number }[] = [
  { to: '/calendar', label: 'Calendar', row: 'row1', col: 0 },
  { to: '/horoscope', label: 'Horoscope', row: 'row1', col: 1 },
  { to: '/sports', label: 'Sports', row: 'row1', col: 2 },
  { to: '/news', label: 'News', row: 'row1', col: 3 },
  { to: '/tasks', label: 'To Do', row: 'row1', col: 4 },

  { to: '/motivation', label: 'Motivation Quote', row: 'row2', col: 0 },
  { to: '/word-of-the-day', label: 'Word of the Day', row: 'row2', col: 1 },
  { to: '/fun-fact', label: 'Fun Fact of the Day', row: 'row2', col: 2 },
  { to: '/dad-joke', label: 'Daily Dad Joke', row: 'row2', col: 3 },
  { to: '/goals', label: 'Goals', row: 'row2', col: 4 },

  { to: '/progress', label: 'Progress', row: 'row3', col: 0 },
  { to: '/habits', label: 'Habit Tracker', row: 'row3', col: 1 },
  { to: '/tasks', label: "Today's Mission", row: 'row3', col: 2 },
  { to: '/briefing', label: 'Daily Briefing', row: 'row3', col: 3 },
  { to: '/stocks', label: 'Stock Market', row: 'row3', col: 4 },
]

export default function NavMapPage() {
  return (
    <div className="-mx-5 -mt-6 md:-mx-8 md:-mt-8">
      <h1 className="sr-only">Mission Control</h1>

      <div className="relative">
        <img src="/images/nav-map.jpg" alt="RDP 2.0 navigation map" className="block w-full" />

        {tiles.map((tile, i) => {
          const row = ROWS[tile.row]
          const col = COLS[tile.col]
          return (
            <Link
              key={`${tile.to}-${i}`}
              to={tile.to}
              aria-label={tile.label}
              className="group absolute rounded-lg outline-none"
              style={{
                top: `${row.top}%`,
                height: `${row.height}%`,
                left: `${col.left}%`,
                width: `${col.width}%`,
              }}
            >
              <span className="block h-full w-full rounded-lg border-2 border-transparent transition-colors group-hover:border-rdp-amber group-focus-visible:border-rdp-signal group-active:bg-rdp-amber/10" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
