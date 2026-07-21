import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import TabbedCard from '@/components/TabbedCard'
import { Languages, Wind, MessageCircle, Lightbulb, Repeat, ListTodo, Target } from 'lucide-react'
import SpanishWordCard from '@/features/spanish/SpanishWordCard'
import CommunicationTipCard from '@/features/communication/CommunicationTipCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

/**
 * Motivation Quote and Word of the Day moved to Daily Dashboard — the
 * new reference map explicitly lists both under Daily Dashboard, not
 * Mind, joining Fun Fact/Dad Joke which were already there. Spanish and
 * the Communication Tip stayed here since they're more skill-building
 * than pure "read for fun," and the map doesn't suggest moving them.
 */
export default function MindPage() {
  return (
    <div>
      <PillarHero slug="mind" alt="Mind" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mind</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Focus. Learn. Grow. Sharpen your mind every day.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Daily Reads" subtitle="Spanish, Communication Tip" icon={Languages} defaultOpen>
          <TabbedCard
            tabs={[
              { label: 'Spanish', content: <SpanishWordCard /> },
              { label: 'Comm. Tip', content: <CommunicationTipCard /> },
            ]}
          />
        </Disclosure>

        <Disclosure title="Meditate" subtitle="Breathing Meditation" icon={Wind} defaultOpen>
          <BreathingTimer />
        </Disclosure>

        <Disclosure
          title="Communication Practice Journal"
          subtitle="Log real interactions, reflect"
          icon={MessageCircle}
          defaultOpen
        >
          <CommunicationJournalCard />
        </Disclosure>

        <Disclosure title="Idea Vault" icon={Lightbulb}>
          <IdeaVaultSection />
        </Disclosure>

        <Disclosure title="Habits" subtitle="Includes Spanish practice" icon={Repeat}>
          <PillarHabits pillar="mind" />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Mind-tagged to-dos" icon={ListTodo}>
          <TaskList view="today" pillar="mind" quickAddPlaceholder="Add a Mind task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Mind-tagged goals" icon={Target}>
          <PillarGoals pillar="mind" />
        </Disclosure>
      </div>
    </div>
  )
}
