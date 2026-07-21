import { useState, type FormEvent } from 'react'
import { useExerciseLog } from './useExerciseLog'
import type { ExerciseCategory } from '@/types/exercise'

const categories: { value: ExerciseCategory; label: string }[] = [
  { value: 'strength', label: 'Strength & Conditioning' },
  { value: 'aerobic', label: 'Aerobic' },
  { value: 'stretching', label: 'Stretching' },
]

export default function ExerciseLogCard() {
  const { logs, loading, error, addLog, deleteLog } = useExerciseLog()
  const [category, setCategory] = useState<ExerciseCategory>('strength')
  const [activity, setActivity] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activity.trim()) return
    addLog({
      category,
      activity: activity.trim(),
      durationMinutes: duration ? Number(duration) : undefined,
      notes: notes.trim() || undefined,
    })
    setActivity('')
    setDuration('')
    setNotes('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                category === c.value
                  ? 'border-rdp-signal bg-rdp-signal/15 text-rdp-signal'
                  : 'border-rdp-line text-rdp-text-dim'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Activity (e.g. Bench press, Running, Yoga)"
            className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Min"
            className="w-16 rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <button type="submit" className="w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Log it
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No workouts logged yet — add one above.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group flex items-center justify-between border-b border-rdp-line py-2.5 last:border-b-0">
              <div>
                <p className="text-sm text-rdp-text">{log.activity}</p>
                <p className="font-mono text-xs text-rdp-text-faint">
                  {categories.find((c) => c.value === log.category)?.label}
                  {log.duration_minutes ? ` · ${log.duration_minutes}min` : ''} ·{' '}
                  {new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${log.activity}"? This can't be undone.`)) deleteLog(log.id)
                }}
                className="text-xs text-rdp-text-faint hover:text-rdp-risk"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
