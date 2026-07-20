import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Headline = { title: string; url: string; source: string; publishedAt: string | null }
type NewsResponse = { tech: Headline[]; general: Headline[]; beverage: Headline[]; weird: Headline[]; errors?: string[] }

const CATEGORIES: { key: keyof Omit<NewsResponse, 'errors'>; label: string }[] = [
  { key: 'tech', label: 'AI & Technology' },
  { key: 'general', label: 'General' },
  { key: 'beverage', label: 'Beverage' },
  { key: 'weird', label: 'Weird News' },
]

/**
 * Real headlines from free sources — Hacker News + NPR for the original
 * two categories, Google News RSS search for Beverage and Weird News
 * (any keyword works with that source, no key needed). See
 * netlify/functions/news.ts. Never AI-generated or invented — news is
 * one of the categories the brief explicitly requires to be
 * evidence-based.
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
          {CATEGORIES.map(({ key, label }) => (
            <div key={key}>
              <p className="text-xs font-medium text-rdp-amber">{label}</p>
              <ul className="mt-2 space-y-2">
                {news[key].length === 0 && <li className="text-sm text-rdp-text-faint">Unavailable right now.</li>}
                {news[key].map((h) => (
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
          ))}
        </div>
      )}
    </div>
  )
}
