import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Headline = { title: string; url: string; source: string; publishedAt: string | null }
type NewsResponse = { tech: Headline[]; general: Headline[]; errors?: string[] }

/**
 * Real headlines from free sources (Hacker News + NPR) — see
 * netlify/functions/news.ts. Never AI-generated or invented, unlike
 * HoroscopeCard — news is one of the categories the brief explicitly
 * requires to be evidence-based.
 */
export default function NewsCard() {
  const [news, setNews] = useState<NewsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<NewsResponse>('/news')
      .then(setNews)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load news'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Today's Headlines
      </p>

      {loading && <p className="mt-2 text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      {news && (
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-rdp-amber">AI & Technology</p>
            <ul className="mt-2 space-y-2">
              {news.tech.length === 0 && <li className="text-sm text-rdp-text-faint">Unavailable right now.</li>}
              {news.tech.map((h) => (
                <li key={h.url}>
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-rdp-text hover:text-rdp-signal"
                  >
                    {h.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-rdp-amber">General</p>
            <ul className="mt-2 space-y-2">
              {news.general.length === 0 && <li className="text-sm text-rdp-text-faint">Unavailable right now.</li>}
              {news.general.map((h) => (
                <li key={h.url}>
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-rdp-text hover:text-rdp-signal"
                  >
                    {h.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
