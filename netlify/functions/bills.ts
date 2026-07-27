import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/bills             GET (list with current-period paid status), POST (create)
 * /api/bills/:id         PATCH (update), DELETE
 * /api/bills/:id/pay     POST (toggle paid for the current period)
 *
 * Recurring bills (due_day_of_month) reset paid-status each calendar
 * month; one-time bills (due_date) use their own id as the "period" so
 * they're just a single paid/unpaid flag.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function currentPeriodFor(bill: { id: string; is_recurring: boolean }, monthStr: string): string {
  return bill.is_recurring ? monthStr : bill.id
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean) // ['api','bills', maybe id, maybe 'pay']
  const maybeId = segments[2]
  const id = maybeId && UUID_RE.test(maybeId) ? maybeId : null
  const isPay = segments[3] === 'pay'

  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single()
    if (profileError) return errorResponse(profileError, 500)
    const todayStr = todayInTimezone(profile?.timezone || 'America/New_York')
    const monthStr = todayStr.slice(0, 7) // YYYY-MM

    if (req.method === 'GET' && !id) {
      const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('due_day_of_month', { ascending: true, nullsFirst: false })
      if (error) return errorResponse(error, 500)

      const results = await Promise.all(
        (bills ?? []).map(async (bill) => {
          const period = currentPeriodFor(bill, monthStr)
          const { data: payment, error: paymentError } = await supabase
            .from('bill_payments')
            .select('paid_date')
            .eq('bill_id', bill.id)
            .eq('period', period)
            .maybeSingle()
          if (paymentError) throw paymentError
          return { ...bill, isPaidThisPeriod: !!payment, paidDate: payment?.paid_date ?? null }
        }),
      )

      const totalMonthly = results.filter((b) => b.is_recurring).reduce((sum, b) => sum + Number(b.amount), 0)
      const totalUnpaid = results.filter((b) => !b.isPaidThisPeriod).reduce((sum, b) => sum + Number(b.amount), 0)

      return json({ bills: results, totalMonthly, totalUnpaid, today: todayStr })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.name || typeof body.name !== 'string') {
        return json({ error: 'name is required' }, 400)
      }
      if (typeof body.amount !== 'number') {
        return json({ error: 'amount is required' }, 400)
      }

      const { data, error } = await supabase
        .from('bills')
        .insert({
          user_id: userId,
          name: body.name,
          amount: body.amount,
          is_recurring: body.isRecurring ?? true,
          due_day_of_month: body.dueDayOfMonth ?? null,
          due_date: body.dueDate ?? null,
          category: body.category ?? null,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ bill: data }, 201)
    }

    if (req.method === 'POST' && id && isPay) {
      const { data: bill, error: billError } = await supabase.from('bills').select('*').eq('id', id).single()
      if (billError) return errorResponse(billError, 500)
      const period = currentPeriodFor(bill, monthStr)

      const { data: existing, error: existingError } = await supabase
        .from('bill_payments')
        .select('id')
        .eq('bill_id', id)
        .eq('period', period)
        .maybeSingle()
      if (existingError) return errorResponse(existingError, 500)

      if (existing) {
        const { error } = await supabase.from('bill_payments').delete().eq('id', existing.id)
        if (error) return errorResponse(error, 500)
        return json({ isPaidThisPeriod: false })
      } else {
        const { error } = await supabase
          .from('bill_payments')
          .insert({ bill_id: id, period, paid_date: todayStr, amount_paid: bill.amount })
        if (error) return errorResponse(error, 500)
        return json({ isPaidThisPeriod: true })
      }
    }

    if (req.method === 'PATCH' && id && !isPay) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of ['name', 'amount', 'isRecurring', 'dueDayOfMonth', 'dueDate', 'category', 'active'] as const) {
        if (key in body) {
          const column =
            key === 'isRecurring' ? 'is_recurring' : key === 'dueDayOfMonth' ? 'due_day_of_month' : key === 'dueDate' ? 'due_date' : key
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ bill: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('bills').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/bills', '/api/bills/:id', '/api/bills/:id/pay'],
}
