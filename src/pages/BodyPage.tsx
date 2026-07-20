import FrameShell from '@/components/FrameShell'
import Disclosure from '@/components/Disclosure'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import HealthTrends from '@/features/exercise/HealthTrends'
import PillarHabits from '@/features/habits/PillarHabits'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function BodyPage() {
  return (
    <FrameShell
      frameSrc="/images/frames/body.jpg"
      frameAlt="Body — Train. Fuel. Recover. Optimize your physical potential."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Body</h1>
      <div className="space-y-3">
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
    </FrameShell>
  )
}
