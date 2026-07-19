import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/crypto
 *
 * Real prices via CoinGecko's free public API — no key, no signup.
 * Same honest-data approach as weather/news/sports: never fabricated.
 */

const COINS = ['bitcoin', 'ethereum', 'solana']

let cache: { at: number; coins: unknown[] } | null = null
const CACHE_MS = 15 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ coins: cache.coins, cached: true })
    }

    const ids = COINS.join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    )
    if (!res.ok) return json({ error: `CoinGecko fetch failed (${res.status})` }, res.status)
    const data = await res.json()

    const coins = COINS.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      priceUsd: data[id]?.usd ?? null,
      change24h: data[id]?.usd_24h_change ?? null,
    })).filter((c) => c.priceUsd !== null)

    if (coins.length === 0) {
      return json({ error: 'CoinGecko returned no prices' }, 502)
    }

    cache = { at: Date.now(), coins }
    return json({ coins, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/crypto',
}
