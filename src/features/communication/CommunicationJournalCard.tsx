import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'

type LogEntry = {
  id: string
  situation: string
  went_well: string | null
  improve: string | null
  logged_at: string
}

export default function CommunicationJournalCard() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [situation, setSituation] = useState('')
  const [wentWell, setWentWell] = useState('')
  const [improve, setImprove] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get<{ logs: LogEntry[] }>('/communication-log?limit=15')
      .then((res) => setLogs(res.logs))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!situation.trim()) return
    setError(null)
    try {
      await api.post('/communication-log', {
        situation: situation.trim(),
        wentWell: wentWell.trim() || undefined,
        improve: improve.trim() || undefined,
      })
      setSituation('')
      setWentWell('')
      setImprove('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log entry')
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this entry? This can\'t be undone.')) return
    setLogs((prev) => prev.filter((l) => l.id !== id))
    try {
      await api.delete(`/communication-log/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      load()
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="What happened? (e.g. Gave feedback to a teammate)"
          className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <textarea
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          placeholder="What went well? (optional)"
          rows={2}
          className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <textarea
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          placeholder="What would you do differently? (optional)"
          rows={2}
          className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <button type="submit" className="w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Log it
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Nothing logged yet — add an entry above.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-b border-rdp-line py-2.5 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-rdp-text">{log.situation}</p>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="shrink-0 text-xs text-rdp-text-faint hover:text-rdp-risk"
                >
                  Delete
                </button>
              </div>
              {log.went_well && <p className="mt-1 text-xs text-rdp-good">✓ {log.went_well}</p>}
              {log.improve && <p className="mt-0.5 text-xs text-rdp-amber">→ {log.improve}</p>}
              <p className="mt-1 font-mono text-xs text-rdp-text-faint">
                {new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
