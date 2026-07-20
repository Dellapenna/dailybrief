import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/crypto-preferences        GET (list), POST (add a coin)
 * /api/crypto-preferences/:id    DELETE
 *
 * coinId must be a real CoinGecko coin id (e.g. "bitcoin", not "BTC") —
 * use /api/crypto-search to find the right id from a name/ticker before
 * adding.
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
        .from('crypto_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error, 500)
      return json({ coins: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.coinId || typeof body.coinId !== 'string') {
        return json({ error: 'coinId is required' }, 400)
      }
      if (!body?.label || typeof body.label !== 'string') {
        return json({ error: 'label is required' }, 400)
      }

      const { data, error } = await supabase
        .from('crypto_preferences')
        .insert({ user_id: userId, coin_id: body.coinId, label: body.label })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') return json({ error: 'That coin is already in your list' }, 409)
        return errorResponse(error, 500)
      }
      return json({ coin: data }, 201)
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('crypto_preferences').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/crypto-preferences', '/api/crypto-preferences/:id'],
}
