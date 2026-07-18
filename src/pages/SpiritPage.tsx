import Disclosure from '@/components/Disclosure'
import PrayerCard from '@/features/spirit/PrayerCard'
import BreathingTimer from '@/features/spirit/BreathingTimer'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function SpiritPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Spirit</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Faith. Purpose. Peace. Strengthen your soul within.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Prayer" defaultOpen>
          <PrayerCard />
        </Disclosure>

        <Disclosure title="Breathing Meditation" defaultOpen>
          <BreathingTimer />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Spirit-tagged to-dos">
          <TaskList view="today" pillar="spirit" quickAddPlaceholder="Add a Spirit task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Spirit-tagged goals">
          <PillarGoals pillar="spirit" />
        </Disclosure>
      </div>
    </div>
  )
}
