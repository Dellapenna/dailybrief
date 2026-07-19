import SportsCard from '@/features/sports/SportsCard'

export default function SportsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Sports</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">
        Stay updated. Never miss a play. (Eagles, Phillies, 76ers, Flyers — configurable teams coming later.)
      </p>
      <div className="mt-4">
        <SportsCard />
      </div>
    </div>
  )
}
