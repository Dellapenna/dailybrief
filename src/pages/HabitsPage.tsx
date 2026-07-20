import FrameShell from '@/components/FrameShell'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import HabitRow from '@/features/habits/HabitRow'
import { useHabits } from '@/features/habits/useHabits'

export default function HabitsPage() {
  const { habits, loading, error, createHabit, toggleToday, deleteHabit } = useHabits()

  return (
    <FrameShell
      frameSrc="/images/frames/habits.jpg"
      frameAlt="Habits — Small actions. Big transformation."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Habits</h1>

      <QuickAddBar onAdd={createHabit} placeholder="Add a daily habit…" />

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : habits.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">No habits yet. Add one above.</p>
        ) : (
          habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} onToggle={toggleToday} onDelete={(h) => deleteHabit(h.id)} />
          ))
        )}
      </div>
    </FrameShell>
  )
}
