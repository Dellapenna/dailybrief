import FrameShell from '@/components/FrameShell'
import Disclosure from '@/components/Disclosure'
import DadJokeCard from '@/features/dadJoke/DadJokeCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

/**
 * First pillar using the full decorative-frame treatment (FrameShell)
 * rather than a small hero banner — prototype for the other 5 pillars
 * once matching frame art exists for them. Content window coordinates
 * are estimated by eye against the frame's blank parchment area, not
 * pixel-verified — expect to adjust once seen live.
 */
export default function LifePage() {
  return (
    <FrameShell
      frameSrc="/images/frames/life.jpg"
      frameAlt="Life — Live. Love. Lead."
      window={{ top: 23, left: 17, width: 66, height: 52 }}
    >
      <h1 className="sr-only">Life</h1>
      <div className="space-y-3">
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
    </FrameShell>
  )
}
