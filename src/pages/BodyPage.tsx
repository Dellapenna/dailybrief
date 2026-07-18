import Disclosure from '@/components/Disclosure'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import HealthTrends from '@/features/exercise/HealthTrends'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function BodyPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Body</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Train. Fuel. Recover. Optimize your physical potential.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Exercise Log" subtitle="Strength, aerobic, stretching" defaultOpen>
          <ExerciseLogCard />
        </Disclosure>

        <Disclosure title="Health Trends" subtitle="Sleep, energy, weight over time">
          <HealthTrends />
        </Disclosure>

        <Disclosure title="Habits" subtitle="Body-tagged habits">
          <PillarHabits pillar="body" />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Body-tagged to-dos">
          <TaskList view="today" pillar="body" quickAddPlaceholder="Add a Body task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Body-tagged goals">
          <PillarGoals pillar="body" />
        </Disclosure>
      </div>
    </div>
  )
}
