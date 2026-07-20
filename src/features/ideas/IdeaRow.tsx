import type { Idea, IdeaStatus } from '@/types/idea'

const statusOptions: { value: IdeaStatus; label: string }[] = [
  { value: 'captured', label: 'Captured' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'prioritized', label: 'Prioritized' },
  { value: 'building', label: 'Building' },
  { value: 'paused', label: 'Paused' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
]

export default function IdeaRow({
  idea,
  onStatusChange,
  onDelete,
}: {
  idea: Idea
  onStatusChange: (idea: Idea, status: IdeaStatus) => void
  onDelete: (idea: Idea) => void
}) {
  return (
    <div className="group flex items-center gap-3 border-b border-rdp-line px-1 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-rdp-text">{idea.title}</p>
        <p className="mt-0.5 text-xs text-rdp-text-faint">
          Captured {new Date(idea.date_captured).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      </div>
      <select
        value={idea.status}
        onChange={(e) => onStatusChange(idea, e.target.value as IdeaStatus)}
        className="shrink-0 rounded-lg border border-rdp-line bg-rdp-void px-2 py-1 text-xs text-rdp-text focus:border-rdp-signal focus:outline-none"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          if (window.confirm(`Delete "${idea.title}"? This can't be undone.`)) onDelete(idea)
        }}
        aria-label="Delete idea"
        className="shrink-0 text-xs text-rdp-text-faint hover:text-rdp-risk"
      >
        Delete
      </button>
    </div>
  )
}
