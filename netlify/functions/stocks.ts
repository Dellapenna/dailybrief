import type { Config, Context } from '@netlify/functions'
import { json } from './shared/http'

/**
 * GET /api/stocks — NOT YET LIVE.
 *
 * Financial data must come from a real, reliable source — never
 * fabricated, per the brief. Unlike weather/news/sports, there's no
 * reasonable free-no-key option here worth trusting for market data, so
 * this waits for a real provider key rather than shipping something
 * shaky. Once you have a key (e.g. Alpha Vantage, Finnhub, Twelve Data —
 * all have real free tiers, just require signup), set
 * MARKET_DATA_API_KEY (already reserved in .env.example) and swap the
 * body of this function for a real call. StocksPage.tsx and the frontend
 * need no changes once this returns real data in the same shape.
 */
export default async (_req: Request, _context: Context) => {
  return json(
    {
      error:
        'Stock market data isn\'t connected yet — it needs a real market-data API key (financial data is never fabricated). See the comment in this file / docs/INTEGRATIONS.md.',
    },
    501,
  )
}

export const config: Config = {
  path: '/api/stocks',
}
