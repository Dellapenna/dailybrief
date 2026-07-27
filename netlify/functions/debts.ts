import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/debts       GET (list), POST (create)
 * /api/debts/:id   PATCH (update), DELETE
 *
 * interest_rate is optional by design — see debt-payoff.ts for how the
 * payoff calculator degrades gracefully without it, per direct request
 * that it "still work without all the inputs as long as I put minimum
 * payment details."
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
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error, 500)
      return json({ debts: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.name || typeof body.name !== 'string') {
        return json({ error: 'name is required' }, 400)
      }
      if (typeof body.balance !== 'number') {
        return json({ error: 'balance is required' }, 400)
      }
      if (typeof body.minimumPayment !== 'number') {
        return json({ error: 'minimumPayment is required' }, 400)
      }

      const { data, error } = await supabase
        .from('debts')
        .insert({
          user_id: userId,
          name: body.name,
          balance: body.balance,
          interest_rate: body.interestRate ?? null,
          minimum_payment: body.minimumPayment,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ debt: data }, 201)
    }

    if (req.method === 'PATCH' && id) {
      const body = await req.json()
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      for (const key of ['name', 'balance', 'interestRate', 'minimumPayment'] as const) {
        if (key in body) {
          const column = key === 'interestRate' ? 'interest_rate' : key === 'minimumPayment' ? 'minimum_payment' : key
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ debt: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('debts').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/debts', '/api/debts/:id'],
}
