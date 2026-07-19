import WordOfDayCard from '@/features/wordOfDay/WordOfDayCard'

export default function WordOfDayPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Word of the Day</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Learn. Grow. Get better.</p>
      <div className="mt-6">
        <WordOfDayCard />
      </div>
    </div>
  )
}
