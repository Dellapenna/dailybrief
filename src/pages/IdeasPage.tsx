import { useState } from 'react'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import IdeaRow from '@/features/ideas/IdeaRow'
import { useIdeas } from '@/features/ideas/useIdeas'
import Tabs from '@/components/Tabs'
import type { IdeaStatus } from '@/types/idea'

const tabs: { value: IdeaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'captured', label: 'Captured' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'prioritized', label: 'Prioritized' },
  { value: 'building', label: 'Building' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
]

export default function IdeasPage() {
  const [active, setActive] = useState<IdeaStatus | 'all'>('all')
  const { ideas, loading, error, createIdea, updateIdea, deleteIdea } = useIdeas(active)

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Idea Vault</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Capture ideas without turning all of them into projects.</p>

      <div className="mt-4">
        <QuickAddBar onAdd={createIdea} placeholder="Capture an idea…" />
      </div>

      <div className="mt-4">
        <Tabs items={tabs} active={active} onChange={setActive} />
      </div>

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : ideas.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Nothing here yet.</p>
        ) : (
          ideas.map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              onStatusChange={(i, status) => updateIdea(i.id, { status })}
              onDelete={(i) => deleteIdea(i.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
