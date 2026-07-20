import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/stock-preferences        GET (list), POST (add a symbol)
 * /api/stock-preferences/:id    DELETE
 *
 * Symbols are ticker symbols as Finnhub expects them (e.g. "AAPL"), not
 * company names — stocks.ts doesn't validate them here, an unresolvable
 * symbol just gets silently skipped when quotes are fetched (same
 * failure mode as an unresolvable team name in sports.ts).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const maybeId = segments[2]
  const id = maybeId && UUID_RE.test(maybeId) ? maybeId : null

  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    if (req.method === 'GET' && !id) {
      const { data, error } = await supabase
        .from('stock_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error, 500)
      return json({ stocks: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.symbol || typeof body.symbol !== 'string') {
        return json({ error: 'symbol is required' }, 400)
      }

      const symbol = body.symbol.trim().toUpperCase()
      const { data, error } = await supabase
        .from('stock_preferences')
        .insert({ user_id: userId, symbol, label: body.label ?? null })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') return json({ error: 'That symbol is already in your list' }, 409)
        return errorResponse(error, 500)
      }
      return json({ stock: data }, 201)
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('stock_preferences').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/stock-preferences', '/api/stock-preferences/:id'],
}
