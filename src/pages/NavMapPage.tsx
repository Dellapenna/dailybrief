import { Link } from 'react-router-dom'

/**
 * Home / navigation hub — v4, rebuilt for the pillar-based structure
 * (Mission Control / Body / Mind / Spirit / Life / Work / Intelligence),
 * replacing the earlier flat 15-category map. Same image-with-tap-zones
 * technique as before. Coordinates are estimated by eye against the new
 * image's layout (3 centered items — Mission Control/Spirit/Intelligence
 * — alternating with 2 left/right pairs — Body+Mind, Life+Work) — not
 * pixel-perfect; nudge specific zones based on feedback once live.
 */
const ZONES: { to: string; label: string; top: number; height: number; left: number; width: number }[] = [
  { to: '/mission-control', label: 'Mission Control', top: 22, height: 15, left: 20, width: 60 },
  { to: '/body', label: 'Body', top: 32, height: 15, left: 2, width: 45 },
  { to: '/mind', label: 'Mind', top: 32, height: 15, left: 53, width: 45 },
  { to: '/spirit', label: 'Spirit', top: 50, height: 14, left: 20, width: 60 },
  { to: '/life', label: 'Life', top: 64, height: 14, left: 2, width: 45 },
  { to: '/work', label: 'Work', top: 64, height: 14, left: 53, width: 45 },
  { to: '/intelligence', label: 'Intelligence', top: 78, height: 13, left: 20, width: 60 },
]

export default function NavMapPage() {
  return (
    <div className="-mx-5 -mt-6 md:-mx-8 md:-mt-8">
      <h1 className="sr-only">Mission Control</h1>

      <div className="relative">
        <img
          src="/images/nav-map.jpg"
          alt="RDP 2.0 navigation map"
          className="block w-full brightness-125 contrast-105"
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
