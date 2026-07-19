import { useState, type FormEvent } from 'react'

/**
 * The global fast-capture entry point — the one piece of UI this whole
 * feature is built around (see docs/BUILD_PLAN.md Phase 2, Option C).
 * Deliberately just a title field: no due date picker, no project
 * dropdown here. Capture first, organize later (in the task itself).
 */
export default function QuickAddBar({
  onAdd,
  placeholder = 'Add a task…',
}: {
  onAdd: (title: string) => void
  placeholder?: string
}) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const title = value.trim()
    if (!title) return
    onAdd(title)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2.5 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
      />
      <button
        type="submit"
        className="rounded-lg bg-rdp-signal px-4 py-2.5 text-sm font-medium text-white hover:bg-rdp-signal-dim"
      >
        Add
      </button>
    </form>
  )
}
