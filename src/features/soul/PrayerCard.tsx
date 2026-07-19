import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useHabitByName } from '@/features/habits/useHabitByName'

export default function PrayerCard() {
  const [prompt, setPrompt] = useState<string | null>(null)
  const { habit, loading, toggleToday } = useHabitByName('soul', 'Prayer')

  useEffect(() => {
    api
      .get<{ prompt: string }>('/prayer-prompt')
      .then((res) => setPrompt(res.prompt))
      .catch(() => setPrompt(null))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {prompt && <p className="text-sm text-rdp-text">{prompt}</p>}

      {!loading && habit && (
        <div className="mt-3 flex items-center justify-between">
          <p className="font-mono text-xs tabular-nums text-rdp-text-faint">
            streak {habit.currentStreak}d · best {habit.longestStreak}d
          </p>
          <button
            onClick={() => toggleToday(habit)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              habit.completedToday
                ? 'border-rdp-good bg-rdp-good/15 text-rdp-good'
                : 'border-rdp-line text-rdp-text-dim hover:border-rdp-signal'
            }`}
          >
            {habit.completedToday ? 'Done today ✓' : 'Mark as done'}
          </button>
        </div>
      )}
    </div>
  )
}
