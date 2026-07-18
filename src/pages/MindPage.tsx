import Disclosure from '@/components/Disclosure'
import MotivationCard from '@/features/motivation/MotivationCard'
import WordOfDayCard from '@/features/wordOfDay/WordOfDayCard'
import SpanishWordCard from '@/features/spanish/SpanishWordCard'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function MindPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Mind</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Focus. Learn. Grow. Sharpen your mind every day.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Motivation Quote" defaultOpen>
          <MotivationCard />
        </Disclosure>

        <Disclosure title="Word of the Day">
          <WordOfDayCard />
        </Disclosure>

        <Disclosure title="Spanish Word of the Day">
          <SpanishWordCard />
        </Disclosure>

        <Disclosure title="Habits" subtitle="Includes Spanish practice" defaultOpen>
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
