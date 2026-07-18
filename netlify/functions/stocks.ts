import type { Config, Context } from '@netlify/functions'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/stocks
 *
 * Real market data via Finnhub's free tier (60 calls/min, no credit card
 * needed for the free key). Financial data is never fabricated, per the
 * brief -- this only ever returns what the provider reports.
 *
 * v1 assumption: hardcoded watchlist rather than user-configurable
 * symbols (same pattern as sports.ts's hardcoded favorite teams).
 * Indexes are tracked via their most common ETF proxies since free-tier
 * market data providers generally don't expose raw index values --
 * DIA/SPY/QQQ/IWM track the Dow/S&P 500/Nasdaq 100/Russell 2000 closely
 * enough for a personal dashboard, though they are technically ETF
 * prices, not the index values themselves.
 *
 * Informational only -- never individualized investment advice, per the
 * brief's explicit instruction on market content.
 */

const WATCHLIST: { symbol: string; label: string }[] = [
  { symbol: 'DIA', label: 'Dow Jones (DIA)' },
  { symbol: 'SPY', label: 'S&P 500 (SPY)' },
  { symbol: 'QQQ', label: 'Nasdaq 100 (QQQ)' },
  { symbol: 'IWM', label: 'Russell 2000 (IWM)' },
]

type Quote = {
  symbol: string
  label: string
  price: number
  change: number
  percentChange: number
  previousClose: number
}

let cache: { at: number; quotes: Quote[] } | null = null
const CACHE_MS = 15 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ quotes: cache.quotes, cached: true })
    }

    const apiKey = requireEnv('MARKET_DATA_API_KEY')

    const results = await Promise.allSettled(
      WATCHLIST.map(async ({ symbol, label }) => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
        )
        if (!res.ok) throw new Error(`${symbol} fetch failed (${res.status})`)
        const data = await res.json()
        if (typeof data.c !== 'number') throw new Error(`${symbol} returned no price`)
        return {
          symbol,
          label,
          price: data.c,
          change: data.d,
          percentChange: data.dp,
          previousClose: data.pc,
        } satisfies Quote
      }),
    )

    const quotes = results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
      .map((r) => r.value)

    if (quotes.length === 0) {
      return json({ error: 'Could not fetch any quotes -- check MARKET_DATA_API_KEY' }, 502)
    }

    cache = { at: Date.now(), quotes }
    return json({ quotes, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/stocks',
}
