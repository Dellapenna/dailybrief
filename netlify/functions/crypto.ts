import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/crypto
 *
 * Real prices via CoinGecko's free public API — no key, no signup.
 * Same honest-data approach as weather/news/sports: never fabricated.
 *
 * Watchlist now comes from crypto_preferences (editable in Settings)
 * instead of being hardcoded — falls back to Bitcoin/Ethereum/Solana if
 * the table is somehow empty.
 */

const FALLBACK_COINS: { coin_id: string; label: string }[] = [
  { coin_id: 'bitcoin', label: 'Bitcoin' },
  { coin_id: 'ethereum', label: 'Ethereum' },
  { coin_id: 'solana', label: 'Solana' },
]

let cache: { at: number; coins: unknown[] } | null = null
const CACHE_MS = 15 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ coins: cache.coins, cached: true })
    }

    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()
    const { data: prefs, error: prefsError } = await supabase
      .from('crypto_preferences')
      .select('coin_id, label')
      .eq('user_id', userId)
    if (prefsError) return errorResponse(prefsError, 500)

    const watchlist = prefs && prefs.length > 0 ? prefs : FALLBACK_COINS

    const ids = watchlist.map((c) => c.coin_id).join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    )
    if (!res.ok) return json({ error: `CoinGecko fetch failed (${res.status})` }, res.status)
    const data = await res.json()

    const coins = watchlist
      .map((c) => ({
        id: c.coin_id,
        label: c.label,
        priceUsd: data[c.coin_id]?.usd ?? null,
        change24h: data[c.coin_id]?.usd_24h_change ?? null,
      }))
      .filter((c) => c.priceUsd !== null)

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
