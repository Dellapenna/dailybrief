import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import { Dumbbell, Utensils, Activity, ListTodo, Target } from 'lucide-react'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import CalorieCounterCard from '@/features/calories/CalorieCounterCard'
import HealthTrends from '@/features/exercise/HealthTrends'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

/**
 * Habits moved to Mission Control's consolidated all-pillars view (with
 * a pillar selector per row) rather than living here separately — see
 * MissionControlPage.tsx.
 */
export default function BodyPage() {
  return (
    <div>
      <PillarHero slug="body" alt="Body" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Body</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Train. Fuel. Recover. Optimize your physical potential.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Exercise Log" subtitle="Strength, aerobic, stretching" icon={Dumbbell} defaultOpen>
          <ExerciseLogCard />
        </Disclosure>

        <Disclosure title="Calorie Counter" subtitle="Fuel — search or log manually" icon={Utensils} defaultOpen>
          <CalorieCounterCard />
        </Disclosure>

        <Disclosure title="Health Trends" subtitle="Sleep, energy, weight over time" icon={Activity}>
          <HealthTrends />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Body-tagged to-dos" icon={ListTodo}>
          <TaskList view="today" pillar="body" quickAddPlaceholder="Add a Body task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Body-tagged goals" icon={Target}>
          <PillarGoals pillar="body" />
        </Disclosure>
      </div>
    </div>
  )
}
