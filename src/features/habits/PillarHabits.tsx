import QuickAddBar from '@/features/tasks/QuickAddBar'
import HabitRow from './HabitRow'
import { useHabits } from './useHabits'
import type { PillarId } from '@/types/pillar'

export default function PillarHabits({ pillar }: { pillar: PillarId }) {
  const { habits, loading, error, createHabit, toggleToday, deleteHabit } = useHabits(pillar)

  return (
    <div>
      <QuickAddBar onAdd={createHabit} placeholder="Add a habit…" />
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : habits.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No habits yet.</p>
        ) : (
          habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} onToggle={toggleToday} onDelete={(h) => deleteHabit(h.id)} />
          ))
        )}
      </div>
    </div>
  )
}
