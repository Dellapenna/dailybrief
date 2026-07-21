import { useEffect, useState } from 'react'
import { useTodayCheckin } from './useTodayCheckin'

const primaryScaleFields = [
  { key: 'energy', label: 'Energy' },
  { key: 'mood', label: 'Mood' },
] as const

const moreScaleFields = [
  { key: 'sleep_quality', label: 'Sleep quality' },
  { key: 'stress', label: 'Stress' },
] as const

/**
 * Trimmed to 3 fields shown by default (Energy, Mood, Most important
 * outcome), per direct feedback that the full 10-field version was too
 * much to face every morning and was contributing to inconsistent daily
 * use. Everything else (sleep hours/quality, stress, glucose, weight,
 * symptoms, planned exercise, biggest concern) still exists and still
 * saves — just tucked behind "Add more details" for days worth going
 * deeper, rather than demanding all of it every time.
 */
export default function CheckInForm() {
  const { checkin, loading, saving, saved, error, save } = useTodayCheckin()
  const [showMore, setShowMore] = useState(false)

  const [form, setForm] = useState({
    sleep_duration: '',
    sleep_quality: 3,
    energy: 3,
    mood: 3,
    stress: 3,
    glucose: '',
    weight: '',
    symptoms: '',
    planned_exercise: '',
    biggest_concern: '',
    most_important_outcome: '',
  })

  useEffect(() => {
    if (!checkin) return
    setForm({
      sleep_duration: checkin.sleep_duration?.toString() ?? '',
      sleep_quality: checkin.sleep_quality ?? 3,
      energy: checkin.energy ?? 3,
      mood: checkin.mood ?? 3,
      stress: checkin.stress ?? 3,
      glucose: checkin.glucose?.toString() ?? '',
      weight: checkin.weight?.toString() ?? '',
      symptoms: checkin.symptoms ?? '',
      planned_exercise: checkin.planned_exercise ?? '',
      biggest_concern: checkin.biggest_concern ?? '',
      most_important_outcome: checkin.most_important_outcome ?? '',
    })
    // If any of the "more" fields already have data (e.g. from before
    // this change, or set on a different device), show them expanded
    // rather than hiding data that's already there.
    const hasMoreData =
      checkin.sleep_duration != null ||
      checkin.stress != null ||
      checkin.glucose != null ||
      checkin.weight != null ||
      checkin.symptoms ||
      checkin.planned_exercise ||
      checkin.biggest_concern
    if (hasMoreData) setShowMore(true)
  }, [checkin])

  function handleSave() {
    save({
      sleep_duration: form.sleep_duration ? Number(form.sleep_duration) : null,
      sleep_quality: form.sleep_quality,
      energy: form.energy,
      mood: form.mood,
      stress: form.stress,
      glucose: form.glucose ? Number(form.glucose) : null,
      weight: form.weight ? Number(form.weight) : null,
      symptoms: form.symptoms || null,
      planned_exercise: form.planned_exercise || null,
      biggest_concern: form.biggest_concern || null,
      most_important_outcome: form.most_important_outcome || null,
    })
  }

  if (loading) return <p className="text-sm text-rdp-text-faint">Loading…</p>

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Morning Check-in
      </p>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {primaryScaleFields.map((f) => (
          <div key={f.key}>
            <label className="flex justify-between text-xs text-rdp-text-dim">
              <span>{f.label}</span>
              <span className="font-mono tabular-nums text-rdp-text">{form[f.key]}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
              className="mt-1 w-full accent-rdp-signal"
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Most important outcome today"
          value={form.most_important_outcome}
          onChange={(e) => setForm((prev) => ({ ...prev, most_important_outcome: e.target.value }))}
          className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
      </div>

      <button
        onClick={() => setShowMore((s) => !s)}
        className="mt-3 text-xs font-medium text-rdp-signal"
      >
        {showMore ? '− Hide details' : '+ Add more details'}
      </button>

      {showMore && (
        <div className="mt-3 space-y-4 border-t border-rdp-line pt-3">
          <div className="grid gap-4 sm:grid-cols-2">
            {moreScaleFields.map((f) => (
              <div key={f.key}>
                <label className="flex justify-between text-xs text-rdp-text-dim">
                  <span>{f.label}</span>
                  <span className="font-mono tabular-nums text-rdp-text">{form[f.key]}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  className="mt-1 w-full accent-rdp-signal"
                />
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-rdp-text-dim">Sleep (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={form.sleep_duration}
                onChange={(e) => setForm((prev) => ({ ...prev, sleep_duration: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-rdp-text-dim">Glucose</label>
              <input
                type="number"
                value={form.glucose}
                onChange={(e) => setForm((prev) => ({ ...prev, glucose: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-rdp-text-dim">Weight</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Biggest concern"
              value={form.biggest_concern}
              onChange={(e) => setForm((prev) => ({ ...prev, biggest_concern: e.target.value }))}
              className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
            />
            <input
              type="text"
              placeholder="Planned exercise"
              value={form.planned_exercise}
              onChange={(e) => setForm((prev) => ({ ...prev, planned_exercise: e.target.value }))}
              className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
            />
            <input
              type="text"
              placeholder="Symptoms (optional)"
              value={form.symptoms}
              onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
              className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-rdp-signal px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save check-in'}
        </button>
        {saved && <span className="text-xs text-rdp-good">Saved</span>}
      </div>
    </div>
  )
}
