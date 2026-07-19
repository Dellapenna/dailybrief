import type { Config, Context } from '@netlify/functions'
import { XMLParser } from 'fast-xml-parser'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/news
 *
 * Real headlines only, per the brief's "evidence over invention"
 * principle — news must come from real sources, never fabricated (unlike
 * horoscope.ts, which is explicitly labeled entertainment). Two free,
 * no-API-key sources:
 *  - Hacker News (Algolia API) for AI/tech — matches the brief's
 *    "AI and Technology" briefing section.
 *  - NPR's public "Top Stories" RSS feed for general news.
 * Both cached in-memory per Function instance for 15 minutes so a page
 * full of reloads doesn't hammer either source — not persisted to the
 * database like calendar events, since news doesn't need a durable
 * per-user cache the way a personal calendar does.
 */

type Headline = { title: string; url: string; source: string; publishedAt: string | null }

let cache: { at: number; tech: Headline[]; general: Headline[] } | null = null
const CACHE_MS = 15 * 60 * 1000

async function fetchTech(): Promise<Headline[]> {
  const res = await fetch(
    'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=6',
  )
  if (!res.ok) throw new Error(`Hacker News fetch failed (${res.status})`)
  const data = await res.json()
  return (data.hits ?? []).map((hit: { title: string; url: string | null; objectID: string; created_at: string }) => ({
    title: hit.title,
    url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
    source: 'Hacker News',
    publishedAt: hit.created_at ?? null,
  }))
}

async function fetchGeneral(): Promise<Headline[]> {
  const res = await fetch('https://feeds.npr.org/1001/rss.xml')
  if (!res.ok) throw new Error(`NPR RSS fetch failed (${res.status})`)
  const xml = await res.text()
  const parser = new XMLParser()
  const parsed = parser.parse(xml)
  const items = parsed?.rss?.channel?.item ?? []
  const list = Array.isArray(items) ? items : [items]
  return list.slice(0, 6).map((item: { title: string; link: string; pubDate?: string }) => ({
    title: item.title,
    url: item.link,
    source: 'NPR',
    publishedAt: item.pubDate ?? null,
  }))
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ tech: cache.tech, general: cache.general, cached: true })
    }

    const [techResult, generalResult] = await Promise.allSettled([fetchTech(), fetchGeneral()])

    const tech = techResult.status === 'fulfilled' ? techResult.value : []
    const general = generalResult.status === 'fulfilled' ? generalResult.value : []

    cache = { at: Date.now(), tech, general }

    return json({
      tech,
      general,
      cached: false,
      errors: [
        techResult.status === 'rejected' ? `Tech: ${techResult.reason}` : null,
        generalResult.status === 'rejected' ? `General: ${generalResult.reason}` : null,
      ].filter(Boolean),
    })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/news',
}
