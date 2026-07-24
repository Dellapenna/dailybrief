import { useState } from 'react'
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

/**
 * Expandable + fully editable, matching TaskRow's pattern — previously
 * only the status dropdown was editable; title, description, and notes
 * had no edit path at all once captured.
 */
export default function IdeaRow({
  idea,
  onUpdate,
  onDelete,
}: {
  idea: Idea
  onUpdate: (idea: Idea, updates: Partial<Idea>) => void
  onDelete: (idea: Idea) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(idea.title)
  const [description, setDescription] = useState(idea.description ?? '')
  const [notes, setNotes] = useState(idea.notes ?? '')

  function saveField(field: 'title' | 'description' | 'notes', value: string) {
    onUpdate(idea, { [field]: value || null } as Partial<Idea>)
  }

  return (
    <div className="border-b border-rdp-line py-1 last:border-b-0">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 py-2 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-rdp-text">{idea.title}</p>
          <p className="mt-0.5 text-xs text-rdp-text-faint">
            Captured {new Date(idea.date_captured).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {idea.notes && ' · has notes'}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-rdp-line px-2 py-0.5 text-[10px] text-rdp-text-dim">
          {statusOptions.find((s) => s.value === idea.status)?.label}
        </span>
        <span className={`shrink-0 font-mono text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="space-y-3 pb-3">
          <div>
            <label className="text-xs text-rdp-text-faint">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== idea.title && saveField('title', title.trim())}
              className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-rdp-text-faint">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description !== (idea.description ?? '') && saveField('description', description)}
              rows={2}
              placeholder="What is this idea?"
              className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-rdp-text-faint">Notes — ponder the idea</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== (idea.notes ?? '') && saveField('notes', notes)}
              rows={4}
              placeholder="Keep coming back to this — jot down thoughts, questions, angles as they occur to you"
              className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <select
              value={idea.status}
              onChange={(e) => onUpdate(idea, { status: e.target.value as IdeaStatus })}
              className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-1.5 text-xs text-rdp-text focus:border-rdp-signal focus:outline-none"
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
              className="text-xs text-rdp-text-faint hover:text-rdp-risk"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
