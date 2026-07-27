import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Skeleton from '@/components/Skeleton'
import type { BankTransaction } from '@/types/banking'

/**
 * A manual check register — like a paper checkbook, not real bank sync,
 * per direct request. Running balance is always computed fresh by the
 * backend from starting_balance + every transaction in order, so
 * editing an old entry can never leave stale balances downstream.
 */
export default function RegisterCard() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [startingBalance, setStartingBalance] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [isDeposit, setIsDeposit] = useState(false)
  const [category, setCategory] = useState('')

  function load() {
    setLoading(true)
    api
      .get<{ transactions: BankTransaction[]; startingBalance: number; currentBalance: number }>('/bank-register')
      .then((res) => {
        setTransactions(res.transactions)
        setStartingBalance(res.startingBalance)
        setCurrentBalance(res.currentBalance)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load register'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function addTransaction() {
    const amt = Number(amount)
    if (!description.trim() || !amt) return
    try {
      await api.post('/bank-register', {
        transactionDate: date,
        description: description.trim(),
        amount: isDeposit ? Math.abs(amt) : -Math.abs(amt),
        category: category.trim() || undefined,
      })
      setDescription('')
      setAmount('')
      setCategory('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    }
  }

  async function deleteTransaction(id: string) {
    if (!window.confirm('Delete this transaction? This can\u2019t be undone.')) return
    try {
      await api.delete(`/bank-register/${id}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Current Balance</p>
        {loading ? (
          <Skeleton lines={1} className="mt-2" />
        ) : (
          <p className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${currentBalance < 0 ? 'text-rdp-risk' : 'text-rdp-text'}`}>
            ${currentBalance.toFixed(2)}
          </p>
        )}
        <p className="mt-1 text-xs text-rdp-text-faint">Starting balance: ${startingBalance.toFixed(2)} (set in Settings)</p>
      </div>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Add Transaction</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
          />
          <div className="flex rounded-lg border border-rdp-line p-0.5">
            <button
              type="button"
              onClick={() => setIsDeposit(false)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium ${!isDeposit ? 'bg-rdp-risk/15 text-rdp-risk' : 'text-rdp-text-dim'}`}
            >
              Withdrawal
            </button>
            <button
              type="button"
              onClick={() => setIsDeposit(true)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium ${isDeposit ? 'bg-rdp-good/15 text-rdp-good' : 'text-rdp-text-dim'}`}
            >
              Deposit
            </button>
          </div>
        </div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="mt-2 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
        </div>
        <button onClick={addTransaction} className="mt-2 w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No transactions yet — add one above.</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between border-b border-rdp-line py-2.5 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-rdp-text">{t.description}</p>
                <p className="font-mono text-xs text-rdp-text-faint">
                  {new Date(t.transaction_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  {t.category ? ` · ${t.category}` : ''}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-mono text-sm tabular-nums ${t.amount < 0 ? 'text-rdp-risk' : 'text-rdp-good'}`}>
                  {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                </p>
                <p className="font-mono text-xs tabular-nums text-rdp-text-faint">${t.running_balance.toFixed(2)}</p>
              </div>
              <button
                onClick={() => deleteTransaction(t.id)}
                className="ml-2 shrink-0 text-xs text-rdp-text-faint hover:text-rdp-risk"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
