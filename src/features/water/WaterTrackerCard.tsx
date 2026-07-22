import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Skeleton from '@/components/Skeleton'
import WaterGlass from './WaterGlass'

/**
 * Tap a glass to fill up to it (or empty back down to it, if it's
 * already filled) — same interaction as a star rating. Each glass is
 * 8oz; the goal is 8 glasses (64oz/day), the common daily
 * recommendation. Saves immediately on tap, no separate "save" step.
 */
export default function WaterTrackerCard() {
  const [glasses, setGlasses] = useState(0)
  const [goal, setGoal] = useState(8)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ glassesConsumed: number; goalGlasses: number }>('/water-log')
      .then((res) => {
        setGlasses(res.glassesConsumed)
        setGoal(res.goalGlasses)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function setGlassCount(count: number) {
    setGlasses(count) // optimistic
    try {
      await api.patch<{ glassesConsumed: number }>('/water-log', { glassesConsumed: count })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function handleGlassClick(index: number) {
    // Clicking an already-filled glass empties back down to it;
    // clicking an empty one fills up to it — star-rating behavior.
    const clickedIsFilled = index < glasses
    setGlassCount(clickedIsFilled ? index : index + 1)
  }

  const totalGlasses = Math.max(goal, glasses, 8)

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
          Water — {glasses * 8}oz of {goal * 8}oz
        </p>
        {glasses >= goal && <span className="text-xs font-medium text-rdp-good">Goal met ✓</span>}
      </div>

      {loading && <Skeleton lines={1} className="mt-3" />}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      {!loading && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: totalGlasses }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleGlassClick(i)}
              aria-label={`${i < glasses ? 'Remove' : 'Add'} glass ${i + 1}`}
              className="transition-transform active:scale-90"
            >
              <WaterGlass filled={i < glasses} className="h-8 w-6 text-rdp-text-faint" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
