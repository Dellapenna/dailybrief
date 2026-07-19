import HoroscopeCard from '@/features/horoscope/HoroscopeCard'

export default function HoroscopePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Horoscope</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Discover what the stars say.</p>
      <div className="mt-4">
        <HoroscopeCard />
      </div>
    </div>
  )
}
