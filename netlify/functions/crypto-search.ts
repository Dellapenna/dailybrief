import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/crypto-search?q=doge
 *
 * CoinGecko's free public search endpoint — no key needed. Used by
 * Settings to help find the right coin_id (e.g. "dogecoin") from a
 * name/ticker the person actually knows, since CoinGecko's ids aren't
 * always obvious from the ticker alone.
 */
export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    if (!query) return json({ error: 'q query param is required' }, 400)

    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)
    if (!res.ok) return json({ error: `CoinGecko search failed (${res.status})` }, res.status)
    const data = await res.json()

    const coins = (data.coins ?? []).slice(0, 10).map((c: { id: string; name: string; symbol: string }) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol?.toUpperCase(),
    }))

    return json({ results: coins })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/crypto-search',
}
