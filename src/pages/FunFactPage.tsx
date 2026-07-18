import FunFactCard from '@/features/funFact/FunFactCard'

export default function FunFactPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Fun Fact of the Day</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Be amazed. Every day.</p>
      <div className="mt-6">
        <FunFactCard />
      </div>
    </div>
  )
}
