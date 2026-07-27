import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Skeleton from '@/components/Skeleton'
import type { Debt, DebtPayoffResult } from '@/types/banking'

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (years === 0) return `${months} mo`
  if (remainder === 0) return `${years}y`
  return `${years}y ${remainder}mo`
}

export default function DebtPayoffCard() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [payoff, setPayoff] = useState<DebtPayoffResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [rate, setRate] = useState('')
  const [minPayment, setMinPayment] = useState('')
  const [extraMonthly, setExtraMonthly] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      api.get<{ debts: Debt[] }>('/debts'),
      api.get<DebtPayoffResult>('/debt-payoff'),
    ])
      .then(([debtsRes, payoffRes]) => {
        setDebts(debtsRes.debts)
        setPayoff(payoffRes)
        setExtraMonthly(payoffRes.extraMonthly?.toString() ?? '')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function addDebt() {
    const bal = Number(balance)
    const min = Number(minPayment)
    if (!name.trim() || !bal || !min) return
    try {
      await api.post('/debts', {
        name: name.trim(),
        balance: bal,
        interestRate: rate ? Number(rate) : undefined,
        minimumPayment: min,
      })
      setName('')
      setBalance('')
      setRate('')
      setMinPayment('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add debt')
    }
  }

  async function deleteDebt(id: string) {
    if (!window.confirm('Delete this debt? This can\u2019t be undone.')) return
    try {
      await api.delete(`/debts/${id}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  async function saveExtraMonthly() {
    try {
      await api.patch('/preferences', { extraMonthlyDebtPayment: extraMonthly ? Number(extraMonthly) : null })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Add a Debt</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Visa card, Car loan)"
          className="mt-2 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Balance"
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="APR % (optional)"
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="number"
            value={minPayment}
            onChange={(e) => setMinPayment(e.target.value)}
            placeholder="Min payment"
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
        </div>
        <button onClick={addDebt} className="mt-2 w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Add Debt
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <Skeleton lines={2} className="py-4" />
        ) : debts.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No debts tracked yet — add one above.</p>
        ) : (
          debts.map((d) => (
            <div key={d.id} className="flex items-center justify-between border-b border-rdp-line py-2.5 last:border-b-0">
              <div>
                <p className="text-sm text-rdp-text">{d.name}</p>
                <p className="font-mono text-xs text-rdp-text-faint">
                  ${Number(d.balance).toFixed(2)} · {d.interest_rate != null ? `${d.interest_rate}% APR` : 'no APR set'} · $
                  {Number(d.minimum_payment).toFixed(2)}/mo min
                </p>
              </div>
              <button onClick={() => deleteDebt(d.id)} className="text-xs text-rdp-text-faint hover:text-rdp-risk">
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {debts.length > 0 && (
        <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Extra Monthly Payment</p>
          <p className="mt-1 text-xs text-rdp-text-dim">Beyond minimums — put toward whichever debt the strategy prioritizes.</p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(e.target.value)}
              placeholder="0"
              className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
            />
            <button onClick={saveExtraMonthly} className="rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
              Save
            </button>
          </div>
        </div>
      )}

      {payoff?.note && (
        <div className="mt-3 rounded-xl border border-rdp-amber/40 bg-rdp-panel p-4">
          <p className="text-sm text-rdp-text">{payoff.note}</p>
        </div>
      )}

      {payoff && !payoff.note && payoff.avalanche && payoff.snowball && (
        <div className="mt-3 space-y-3">
          {!payoff.hasAllInterestRates && (
            <p className="text-xs text-rdp-text-faint">
              Not every debt has an interest rate set — the avalanche comparison and interest-cost totals below are
              less precise without it.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
              <p className="text-xs font-medium text-rdp-signal">Avalanche</p>
              <p className="mt-1 text-xs text-rdp-text-faint">Highest interest first</p>
              <p className="mt-2 font-mono text-lg tabular-nums text-rdp-text">{formatMonths(payoff.avalanche.monthsToPayoff)}</p>
              <p className="font-mono text-xs tabular-nums text-rdp-text-faint">${payoff.avalanche.totalInterestPaid} total interest</p>
            </div>
            <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
              <p className="text-xs font-medium text-rdp-amber">Snowball</p>
              <p className="mt-1 text-xs text-rdp-text-faint">Smallest balance first</p>
              <p className="mt-2 font-mono text-lg tabular-nums text-rdp-text">{formatMonths(payoff.snowball.monthsToPayoff)}</p>
              <p className="font-mono text-xs tabular-nums text-rdp-text-faint">${payoff.snowball.totalInterestPaid} total interest</p>
            </div>
          </div>

          {payoff.summary && (
            <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">What This Means</p>
              <p className="mt-1 text-sm text-rdp-text">{payoff.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
