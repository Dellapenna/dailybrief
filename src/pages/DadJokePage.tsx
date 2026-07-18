import DadJokeCard from '@/features/dadJoke/DadJokeCard'

export default function DadJokePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Daily Dad Joke</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Laugh. Share. Make their day.</p>
      <div className="mt-6">
        <DadJokeCard />
      </div>
    </div>
  )
}
