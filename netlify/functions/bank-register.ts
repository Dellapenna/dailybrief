import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/bank-register       GET (list with running balance), POST (create)
 * /api/bank-register/:id   PATCH (update), DELETE
 *
 * Manual entry only — like a paper checkbook register, not real bank
 * sync, per direct request. Running balance is computed here from
 * starting_balance + every transaction in chronological order, never
 * stored per-row (so editing an old transaction can't leave stale
 * balances on later rows — it's always recalculated fresh).
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
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('bank_starting_balance')
        .eq('user_id', userId)
        .single()
      if (prefsError) return errorResponse(prefsError, 500)
      const startingBalance = Number(prefs?.bank_starting_balance ?? 0)

      const { data: transactions, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error, 500)

      let running = startingBalance
      const withBalance = (transactions ?? []).map((t) => {
        running += Number(t.amount)
        return { ...t, running_balance: Math.round(running * 100) / 100 }
      })

      // Most recent first for display, balance already computed above.
      withBalance.reverse()

      return json({
        transactions: withBalance,
        startingBalance,
        currentBalance: Math.round(running * 100) / 100,
      })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.description || typeof body.description !== 'string') {
        return json({ error: 'description is required' }, 400)
      }
      if (typeof body.amount !== 'number') {
        return json({ error: 'amount is required (positive for deposit, negative for withdrawal)' }, 400)
      }

      const { data, error } = await supabase
        .from('bank_transactions')
        .insert({
          user_id: userId,
          transaction_date: body.transactionDate ?? new Date().toISOString().slice(0, 10),
          description: body.description,
          amount: body.amount,
          category: body.category ?? null,
          cleared: body.cleared ?? true,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ transaction: data }, 201)
    }

    if (req.method === 'PATCH' && id) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of ['description', 'amount', 'category', 'cleared', 'transactionDate'] as const) {
        if (key in body) {
          const column = key === 'transactionDate' ? 'transaction_date' : key
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('bank_transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ transaction: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('bank_transactions').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/bank-register', '/api/bank-register/:id'],
}
