import Disclosure from '@/components/Disclosure'
import DadJokeCard from '@/features/dadJoke/DadJokeCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function LifePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Life</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Family. Friends. Fun. Build the life you love to live.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Daily Dad Joke" defaultOpen>
          <DadJokeCard />
        </Disclosure>

        <Disclosure title="Idea Vault">
          <IdeaVaultSection />
        </Disclosure>

        <Disclosure title="Evening Review" defaultOpen>
          <EveningReviewForm />
        </Disclosure>

        <Disclosure title="Habits" subtitle="Life-tagged habits">
          <PillarHabits pillar="life" />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Life-tagged to-dos">
          <TaskList view="today" pillar="life" quickAddPlaceholder="Add a Life task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Life-tagged goals">
          <PillarGoals pillar="life" />
        </Disclosure>
      </div>
    </div>
  )
}
