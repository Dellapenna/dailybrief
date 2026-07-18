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
const FETCH_TIMEOUT_MS =
