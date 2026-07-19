import { Link } from 'react-router-dom'

/**
 * Home / navigation hub — v5, consolidated to 4 quadrant zones (Body,
 * Mind, Soul, Mission Control) plus Daily Dashboard called out
 * separately at the bottom, per a new reference image. Quadrant layout
 * should be far more forgiving to align than the earlier stacked-row
 * images — each zone occupies a clearly separated quarter of the image
 * rather than a thin horizontal band.
 *
 * Coordinates still estimated by eye, not pixel-verified — tell me
 * which zone (if any) needs adjusting once it's live.
 */
const ZONES: { to: string; label: string; top: number; height: number; left: number; width: number }[] = [
  { to: '/body', label: 'Body', top: 20, height: 20, left: 3, width: 45 },
  { to: '/mind', label: 'Mind', top: 20, height: 20, left: 52, width: 45 },
  { to: '/soul', label: 'Soul', top: 58, height: 20, left: 3, width: 45 },
  { to: '/mission-control', label: 'Mission Control', top: 58, height: 20, left: 52, width: 45 },
  { to: '/daily-dashboard', label: 'Daily Dashboard', top: 82, height: 10, left: 20, width: 60 },
]

export default function NavMapPage() {
  return (
    <div className="-mx-5 -mt-6 md:-mx-8 md:-mt-8">
      <h1 className="sr-only">Home</h1>

      <div className="relative">
        <img
          src="/images/nav-map.jpg"
          alt="RDP 2.0 navigation map"
          className="block w-full brightness-[1.375] contrast-105"
        />

        {ZONES.map((zone) => (
          <Link
            key={zone.to}
            to={zone.to}
            aria-label={zone.label}
            className="group absolute rounded-lg outline-none"
            style={{
              top: `${zone.top}%`,
              height: `${zone.height}%`,
              left: `${zone.left}%`,
              width: `${zone.width}%`,
            }}
          >
            <span className="block h-full w-full rounded-lg border-2 border-transparent transition-colors group-hover:border-rdp-amber group-focus-visible:border-rdp-signal group-active:bg-rdp-amber/10" />
          </Link>
        ))}
      </div>
    </div>
  )
}
