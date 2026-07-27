import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/debt-payoff
 *
 * Real month-by-month amortization simulation — not AI-estimated. Two
 * standard strategies:
 *   - Avalanche: pay extra toward the highest interest rate first
 *     (mathematically minimizes total interest paid)
 *   - Snowball: pay extra toward the smallest balance first
 *     (no interest-cost advantage, but clears individual debts sooner,
 *     which some people find motivating)
 *
 * interest_rate is optional per debt, per direct request that this
 * "still work without all the inputs as long as minimum payment" is
 * set. A debt with no rate: no interest is simulated for it (treated as
 * 0% for the payoff math), and it's sorted last for avalanche priority
 * since its true interest cost is unknown. hasAllInterestRates tells
 * the frontend/AI whether the result is a precise interest-cost
 * comparison or a rougher estimate.
 */

type DebtInput = { id: string; name: string; balance: number; interest_rate: number | null; minimum_payment: number }

function simulate(
  debts: DebtInput[],
  extraMonthly: number,
  strategy: 'avalanche' | 'snowball',
): { monthsToPayoff: number; totalInterestPaid: number; payoffOrder: string[] } | null {
  const working = debts.map((d) => ({ ...d, remaining: d.balance }))
  const order =
    strategy === 'avalanche'
      ? [...working].sort((a, b) => (b.interest_rate ?? -1) - (a.interest_rate ?? -1))
      : [...working].sort((a, b) => a.balance - b.balance)

  let totalInterest = 0
  let month = 0
  const payoffOrder: string[] = []
  const paidOff = new Set<string>()
  const MAX_MONTHS = 600 // 50 years — a safety cap, not a realistic expectation

  while (paidOff.size < working.length && month < MAX_MONTHS) {
    month += 1

    // Interest accrues first, on whatever's left from last month.
    for (const d of working) {
      if (d.remaining <= 0 || d.interest_rate == null) continue
      const interest = d.remaining * (d.interest_rate / 100 / 12)
      totalInterest += interest
      d.remaining += interest
    }

    // Minimum payments to every still-active debt.
    for (const d of working) {
      if (d.remaining <= 0) continue
      const payment = Math.min(d.minimum_payment, d.remaining)
      d.remaining -= payment
      if (d.remaining <= 0.01) {
        d.remaining = 0
        if (!paidOff.has(d.id)) {
          paidOff.add(d.id)
          payoffOrder.push(d.name)
        }
      }
    }

    // Extra payment cascades down the priority order to whatever's
    // still active, freeing up as each debt clears.
    let pool = extraMonthly
    for (const d of order) {
      if (pool <= 0) break
      const target = working.find((w) => w.id === d.id)!
      if (target.remaining <= 0) continue
      const payment = Math.min(pool, target.remaining)
      target.remaining -= payment
      pool -= payment
      if (target.remaining <= 0.01) {
        target.remaining = 0
        if (!paidOff.has(target.id)) {
          paidOff.add(target.id)
          payoffOrder.push(target.name)
        }
      }
    }
  }

  if (paidOff.size < working.length) return null // didn't converge — payments don't cover interest

  return { monthsToPayoff: month, totalInterestPaid: Math.round(totalInterest), payoffOrder }
}

export default async (_req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data: debts, error: debtsError } = await supabase
      .from('debts')
      .select('id, name, balance, interest_rate, minimum_payment')
      .eq('user_id', userId)
    if (debtsError) return errorResponse(debtsError, 500)

    if (!debts || debts.length === 0) {
      return json({ note: 'No debts tracked yet — add some to see a real payoff plan.' })
    }

    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('extra_monthly_debt_payment')
      .eq('user_id', userId)
      .single()
    if (prefsError) return errorResponse(prefsError, 500)
    const extraMonthly = Number(prefs?.extra_monthly_debt_payment ?? 0)

    const totalBalance = debts.reduce((sum, d) => sum + Number(d.balance), 0)
    const totalMinimums = debts.reduce((sum, d) => sum + Number(d.minimum_payment), 0)
    const hasAllInterestRates = debts.every((d) => d.interest_rate != null)

    // Upfront check: if minimums + extra don't even cover the interest
    // accruing across all debts at current balances, no simulation will
    // converge — say so honestly instead of silently capping at 600
    // months and returning a meaningless number.
    const monthlyInterestAtStart = debts.reduce(
      (sum, d) => sum + (d.interest_rate ? Number(d.balance) * (Number(d.interest_rate) / 100 / 12) : 0),
      0,
    )
    if (totalMinimums + extraMonthly <= monthlyInterestAtStart) {
      return json({
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalMinimums: Math.round(totalMinimums * 100) / 100,
        extraMonthly,
        hasAllInterestRates,
        note:
          'Your current minimum payments (plus any extra) do not cover the interest accruing on these balances — ' +
          'the debt would grow, not shrink, at this payment level. Increasing the monthly payment is necessary ' +
          'before a payoff timeline is meaningful.',
      })
    }

    const avalanche = simulate(debts, extraMonthly, 'avalanche')
    const snowball = simulate(debts, extraMonthly, 'snowball')

    let summary: string | null = null
    try {
      const apiKey = requireEnv('AI_API_KEY')
      const debtList = debts
        .map((d) => `"${d.name}": $${d.balance} balance, ${d.interest_rate != null ? `${d.interest_rate}% APR` : 'no interest rate given'}, $${d.minimum_payment}/mo minimum`)
        .join('; ')

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system:
            'You are an honest financial calculator assistant, not a licensed advisor. Given real computed debt ' +
            'payoff numbers (from actual amortization math, not your own estimate), explain what they mean in ' +
            'plain terms and note anything worth knowing (e.g. if not all debts have interest rates, the ' +
            'avalanche comparison is less precise). Do not give personalized financial advice beyond explaining ' +
            'the calculated numbers and the standard tradeoff between the two methods. 3-4 sentences.',
          messages: [
            {
              role: 'user',
              content:
                `Debts: ${debtList}. Extra monthly payment beyond minimums: $${extraMonthly}. ` +
                `${avalanche ? `Avalanche: ${avalanche.monthsToPayoff} months, $${avalanche.totalInterestPaid} total interest.` : 'Avalanche did not converge.'} ` +
                `${snowball ? `Snowball: ${snowball.monthsToPayoff} months, $${snowball.totalInterestPaid} total interest.` : 'Snowball did not converge.'} ` +
                `hasAllInterestRates: ${hasAllInterestRates}.`,
            },
          ],
        }),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        summary = aiData?.content?.find((b: { type: string }) => b.type === 'text')?.text ?? null
      }
    } catch {
      summary = null
    }

    return json({
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalMinimums: Math.round(totalMinimums * 100) / 100,
      extraMonthly,
      hasAllInterestRates,
      avalanche,
      snowball,
      summary,
    })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/debt-payoff',
}
