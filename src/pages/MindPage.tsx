import FrameShell from '@/components/FrameShell'
import Disclosure from '@/components/Disclosure'
import MotivationCard from '@/features/motivation/MotivationCard'
import WordOfDayCard from '@/features/wordOfDay/WordOfDayCard'
import SpanishWordCard from '@/features/spanish/SpanishWordCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationTipCard from '@/features/communication/CommunicationTipCard'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function MindPage() {
  return (
    <FrameShell
      frameSrc="/images/frames/mind.jpg"
      frameAlt="Mind — Focus. Learn. Grow. Sharpen your mind every day."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Mind</h1>
      <div className="space-y-3">
        <Disclosure title="Motivation Quote" defaultOpen>
          <MotivationCard />
        </Disclosure>

        <Disclosure title="Word of the Day">
          <WordOfDayCard />
        </Disclosure>

        <Disclosure title="Spanish Word of the Day">
          <SpanishWordCard />
        </Disclosure>

        <Disclosure title="Meditate" subtitle="Breathing Meditation" defaultOpen>
          <BreathingTimer />
        </Disclosure>

        <Disclosure title="Communication Tip" defaultOpen>
          <CommunicationTipCard />
        </Disclosure>

        <Disclosure title="Communication Practice Journal" subtitle="Log real interactions, reflect" defaultOpen>
          <CommunicationJournalCard />
        </Disclosure>

        <Disclosure title="Idea Vault">
          <IdeaVaultSection />
        </Disclosure>

        <Disclosure title="Habits" subtitle="Includes Spanish practice">
          <PillarHabits pillar="mind" />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Mind-tagged to-dos">
          <TaskList view="today" pillar="mind" quickAddPlaceholder="Add a Mind task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Mind-tagged goals">
          <PillarGoals pillar="mind" />
        </Disclosure>
      </div>
    </FrameShell>
  )
}
