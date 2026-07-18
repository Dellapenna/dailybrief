import Disclosure from '@/components/Disclosure'
import PillarHero from '@/components/PillarHero'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'
import PillarHabits from '@/features/habits/PillarHabits'

export default function WorkPage() {
  return (
    <div>
      <PillarHero slug="work" alt="Work" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Work</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Plan. Execute. Win. Build your legacy and impact.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Tasks" subtitle="Work-tagged to-dos" defaultOpen>
          <TaskList view="today" pillar="work" quickAddPlaceholder="Add a Work task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Work-tagged goals">
          <PillarGoals pillar="work" />
        </Disclosure>

        <Disclosure title="Habits" subtitle="Work-tagged habits">
          <PillarHabits pillar="work" />
        </Disclosure>
      </div>
    </div>
  )
}
