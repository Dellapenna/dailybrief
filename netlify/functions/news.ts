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

let cache: { at: number; tech: Headline[]; general: Headline[]; beverage: Headline[]; weird: Headline[] } | null = null
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

/**
 * Google News' free RSS search — no key, works for any keyword query.
 * Titles arrive as "Headline - Source Name"; split that out so `source`
 * reflects the actual publisher rather than always saying "Google News".
 */
async function fetchGoogleNewsQuery(query: string): Promise<Headline[]> {
  const res = await fetch(
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
  )
  if (!res.ok) throw new Error(`Google News fetch failed for "${query}" (${res.status})`)
  const xml = await res.text()
  const parser = new XMLParser()
  const parsed = parser.parse(xml)
  const items = parsed?.rss?.channel?.item ?? []
  const list = Array.isArray(items) ? items : [items]
  return list.slice(0, 6).map((item: { title: string; link: string; pubDate?: string; source?: { '#text'?: string } }) => {
    const dashIndex = item.title?.lastIndexOf(' - ') ?? -1
    const title = dashIndex > -1 ? item.title.slice(0, dashIndex) : item.title
    const source = item.source?.['#text'] || (dashIndex > -1 ? item.title.slice(dashIndex + 3) : 'Google News')
    return { title, url: item.link, source, publishedAt: item.pubDate ?? null }
  })
}

function fetchBeverage(): Promise<Headline[]> {
  return fetchGoogleNewsQuery('beverage industry OR craft beer OR soft drinks')
}

function fetchWeird(): Promise<Headline[]> {
  return fetchGoogleNewsQuery('weird news OR odd news')
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ tech: cache.tech, general: cache.general, beverage: cache.beverage, weird: cache.weird, cached: true })
    }

    const [techResult, generalResult, beverageResult, weirdResult] = await Promise.allSettled([
      fetchTech(),
      fetchGeneral(),
      fetchBeverage(),
      fetchWeird(),
    ])

    const tech = techResult.status === 'fulfilled' ? techResult.value : []
    const general = generalResult.status === 'fulfilled' ? generalResult.value : []
    const beverage = beverageResult.status === 'fulfilled' ? beverageResult.value : []
    const weird = weirdResult.status === 'fulfilled' ? weirdResult.value : []

    cache = { at: Date.now(), tech, general, beverage, weird }

    return json({
      tech,
      general,
      beverage,
      weird,
      cached: false,
      errors: [
        techResult.status === 'rejected' ? `Tech: ${techResult.reason}` : null,
        generalResult.status === 'rejected' ? `General: ${generalResult.reason}` : null,
        beverageResult.status === 'rejected' ? `Beverage: ${beverageResult.reason}` : null,
        weirdResult.status === 'rejected' ? `Weird: ${weirdResult.reason}` : null,
      ].filter(Boolean),
    })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/news',
}
