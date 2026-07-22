import { PILLAR_LABELS, type PillarId } from '@/types/pillar'

type Goal = {
  id: string
  title: string
  status: string
  pillar_id: string | null
  confidence_level: number | null
  estimated_probability: number | null
  target_date: string | null
  next_action: string | null
}

/**
 * Visual progress card per goal. Uses confidence_level (1-10, self-
 * reported when the goal was set/updated) as the progress indicator —
 * the only real, non-invented signal of "how's this going" that exists
 * in the data model right now. Completed goals show full.
 */
export default function GoalProgressCard({ goal }: { goal: Goal }) {
  const pct = goal.status === 'completed' ? 100 : goal.confidence_level ? goal.confidence_level * 10 : null

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-rdp-text">{goal.title}</p>
          {goal.pillar_id && (
            <p className="mt-0.5 font-mono text-xs text-rdp-signal">{PILLAR_LABELS[goal.pillar_id as PillarId] ?? goal.pillar_id}</p>
          )}
        </div>
        {goal.status === 'completed' && <span className="shrink-0 text-xs font-medium text-rdp-good">Done ✓</span>}
      </div>

      {pct !== null ? (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-rdp-line">
            <div
              className={`h-full rounded-full ${goal.status === 'completed' ? 'bg-rdp-good' : 'bg-rdp-signal'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 font-mono text-xs text-rdp-text-faint">
            {goal.status === 'completed' ? 'Completed' : `Confidence: ${goal.confidence_level}/10`}
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-rdp-text-faint">No confidence level set yet.</p>
      )}

      {goal.next_action && <p className="mt-2 text-xs text-rdp-text-dim">Next: {goal.next_action}</p>}
    </div>
  )
}
