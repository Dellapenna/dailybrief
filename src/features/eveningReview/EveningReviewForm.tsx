import { useEffect, useState } from 'react'
import { useTodayReview } from './useTodayReview'

const moreQuestions = [
  { key: 'went_well', label: 'What went well?' },
  { key: 'went_poorly', label: "What didn't go well?" },
  { key: 'lesson', label: 'What did you learn?' },
] as const

/**
 * Trimmed to Day rating + Tomorrow's focus by default, per direct
 * feedback that the full form was too much to face every evening.
 * Went well / went poorly / lesson still exist and still save — tucked
 * behind "Add more details."
 */
export default function EveningReviewForm() {
  const { review, loading, saving, saved, error, save } = useTodayReview()
  const [showMore, setShowMore] = useState(false)

  const [form, setForm] = useState({
    went_well: '',
    went_poorly: '',
    lesson: '',
    tomorrow_focus: '',
    day_rating: 5,
  })

  useEffect(() => {
    if (!review) return
    setForm({
      went_well: review.went_well ?? '',
      went_poorly: review.went_poorly ?? '',
      lesson: review.lesson ?? '',
      tomorrow_focus: review.tomorrow_focus ?? '',
      day_rating: review.day_rating ?? 5,
    })
    if (review.went_well || review.went_poorly || review.lesson) setShowMore(true)
  }, [review])

  function handleSave() {
    save({
      went_well: form.went_well || null,
      went_poorly: form.went_poorly || null,
      lesson: form.lesson || null,
      tomorrow_focus: form.tomorrow_focus || null,
      day_rating: form.day_rating,
    })
  }

  if (loading) return <p className="text-sm text-rdp-text-faint">Loading…</p>

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Evening Close
      </p>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-3 space-y-3">
        <div>
          <label className="flex justify-between text-xs text-rdp-text-dim">
            <span>How would you rate the day?</span>
            <span className="font-mono tabular-nums text-rdp-text">{form.day_rating}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={form.day_rating}
            onChange={(e) => setForm((prev) => ({ ...prev, day_rating: Number(e.target.value) }))}
            className="mt-1 w-full accent-rdp-amber"
          />
        </div>

        <div>
          <label className="text-xs text-rdp-text-dim">What matters tomorrow?</label>
          <textarea
            value={form.tomorrow_focus}
            onChange={(e) => setForm((prev) => ({ ...prev, tomorrow_focus: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
          />
        </div>

        <button onClick={() => setShowMore((s) => !s)} className="text-xs font-medium text-rdp-signal">
          {showMore ? '− Hide details' : '+ Add more details'}
        </button>

        {showMore && (
          <div className="space-y-3 border-t border-rdp-line pt-3">
            {moreQuestions.map((q) => (
              <div key={q.key}>
                <label className="text-xs text-rdp-text-dim">{q.label}</label>
                <textarea
                  value={form[q.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [q.key]: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-rdp-signal px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save review'}
        </button>
        {saved && <span className="text-xs text-rdp-good">Saved</span>}
      </div>
    </div>
  )
}
