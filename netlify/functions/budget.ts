import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/budget       GET (categories + actual spend this month, from the
 *                   register's own category field), POST (create category)
 * /api/budget/:id   PATCH (update), DELETE
 *
 * Actual spending is computed from bank_transactions tagged with a
 * matching category, not entered separately — one source of truth for
 * "what actually happened" (the register) vs. "what was planned"
 * (budget_categories).
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', userId)
        .single()
      if (profileError) return errorResponse(profileError, 500)
      const todayStr = todayInTimezone(profile?.timezone || 'America/New_York')
      const monthStart = todayStr.slice(0, 7) + '-01'

      const { data: categories, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', userId)
        .order('category_name', { ascending: true })
      if (error) return errorResponse(error, 500)

      const { data: transactions, error: txError } = await supabase
        .from('bank_transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .gte('transaction_date', monthStart)
        .lt('amount', 0) // spending only, not deposits
      if (txError) return errorResponse(txError, 500)

      const spentByCategory = new Map<string, number>()
      for (const t of transactions ?? []) {
        if (!t.category) continue
        spentByCategory.set(t.category, (spentByCategory.get(t.category) ?? 0) + Math.abs(Number(t.amount)))
      }

      const results = (categories ?? []).map((c) => ({
        ...c,
        spentThisMonth: Math.round((spentByCategory.get(c.category_name) ?? 0) * 100) / 100,
      }))

      return json({ categories: results, month: todayStr.slice(0, 7) })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.categoryName || typeof body.categoryName !== 'string') {
        return json({ error: 'categoryName is required' }, 400)
      }
      if (typeof body.monthlyBudget !== 'number') {
        return json({ error: 'monthlyBudget is required' }, 400)
      }

      const { data, error } = await supabase
        .from('budget_categories')
        .insert({ user_id: userId, category_name: body.categoryName, monthly_budget: body.monthlyBudget })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') return json({ error: 'That category already exists' }, 409)
        return errorResponse(error, 500)
      }
      return json({ category: data }, 201)
    }

    if (req.method === 'PATCH' && id) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      if ('categoryName' in body) updates.category_name = body.categoryName
      if ('monthlyBudget' in body) updates.monthly_budget = body.monthlyBudget

      const { data, error } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ category: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('budget_categories').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/budget', '/api/budget/:id'],
}
