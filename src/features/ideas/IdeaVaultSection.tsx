import { useState } from 'react'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import IdeaRow from './IdeaRow'
import { useIdeas } from './useIdeas'
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

export default function IdeaVaultSection() {
  const [active, setActive] = useState<IdeaStatus | 'all'>('all')
  const { ideas, loading, error, createIdea, updateIdea, deleteIdea } = useIdeas(active)

  return (
    <div>
      <QuickAddBar onAdd={createIdea} placeholder="Capture an idea…" />
      <div className="mt-3">
        <Tabs items={tabs} active={active} onChange={setActive} />
      </div>
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : ideas.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Nothing captured yet — add an idea above.</p>
        ) : (
          ideas.map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              onUpdate={(i, updates) => updateIdea(i.id, updates)}
              onDelete={(i) => deleteIdea(i.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
