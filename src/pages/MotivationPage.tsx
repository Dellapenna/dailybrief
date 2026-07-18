import MotivationCard from '@/features/motivation/MotivationCard'

export default function MotivationPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Motivation Quote</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Daily fuel for your mind.</p>
      <div className="mt-6">
        <MotivationCard />
      </div>
    </div>
  )
}
