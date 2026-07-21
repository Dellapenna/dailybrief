import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import TabbedCard from '@/components/TabbedCard'
import MotivationCard from '@/features/motivation/MotivationCard'
import WordOfDayCard from '@/features/wordOfDay/WordOfDayCard'
import SpanishWordCard from '@/features/spanish/SpanishWordCard'
import CommunicationTipCard from '@/features/communication/CommunicationTipCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function MindPage() {
  return (
    <div>
      <PillarHero slug="mind" alt="Mind" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mind</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Focus. Learn. Grow. Sharpen your mind every day.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Daily Reads" subtitle="Motivation, Word of the Day, Spanish, Communication Tip" defaultOpen>
          <TabbedCard
            tabs={[
              { label: 'Motivation', content: <MotivationCard /> },
              { label: 'Word of the Day', content: <WordOfDayCard /> },
              { label: 'Spanish', content: <SpanishWordCard /> },
              { label: 'Comm. Tip', content: <CommunicationTipCard /> },
            ]}
          />
        </Disclosure>

        <Disclosure title="Meditate" subtitle="Breathing Meditation" defaultOpen>
          <BreathingTimer />
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
    </div>
  )
}
