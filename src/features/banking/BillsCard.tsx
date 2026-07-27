import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Skeleton from '@/components/Skeleton'
import type { Bill } from '@/types/banking'

export default function BillsCard() {
  const [bills, setBills] = useState<Bill[]>([])
  const [totalMonthly, setTotalMonthly] = useState(0)
  const [totalUnpaid, setTotalUnpaid] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [category, setCategory] = useState('')

  function load() {
    setLoading(true)
    api
      .get<{ bills: Bill[]; totalMonthly: number; totalUnpaid: number }>('/bills')
      .then((res) => {
        setBills(res.bills)
        setTotalMonthly(res.totalMonthly)
        setTotalUnpaid(res.totalUnpaid)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bills'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function addBill() {
    const amt = Number(amount)
    if (!name.trim() || !amt) return
    try {
      await api.post('/bills', {
        name: name.trim(),
        amount: amt,
        isRecurring: true,
        dueDayOfMonth: dueDay ? Number(dueDay) : undefined,
        category: category.trim() || undefined,
      })
      setName('')
      setAmount('')
      setDueDay('')
      setCategory('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bill')
    }
  }

  async function togglePaid(bill: Bill) {
    setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, isPaidThisPeriod: !b.isPaidThisPeriod } : b)))
    try {
      await api.post(`/bills/${bill.id}/pay`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
      load()
    }
  }

  async function deleteBill(id: string) {
    if (!window.confirm('Delete this bill? This can\u2019t be undone.')) return
    try {
      await api.delete(`/bills/${id}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
          <p className="font-mono text-lg tabular-nums text-rdp-text">${totalMonthly.toFixed(2)}</p>
          <p className="text-xs text-rdp-text-faint">Total monthly bills</p>
        </div>
        <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
          <p className={`font-mono text-lg tabular-nums ${totalUnpaid > 0 ? 'text-rdp-amber' : 'text-rdp-good'}`}>
            ${totalUnpaid.toFixed(2)}
          </p>
          <p className="text-xs text-rdp-text-faint">Unpaid this period</p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Add Bill</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bill name (e.g. Rent, Electric)"
          className="mt-2 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="Due day"
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
        </div>
        <button onClick={addBill} className="mt-2 w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Add Bill
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <Skeleton lines={3} className="py-4" />
        ) : bills.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No bills yet — add one above.</p>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className="flex items-center gap-3 border-b border-rdp-line py-2.5 last:border-b-0">
              <button
                onClick={() => togglePaid(bill)}
                aria-label={bill.isPaidThisPeriod ? 'Mark unpaid' : 'Mark paid'}
                className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                  bill.isPaidThisPeriod ? 'border-rdp-good bg-rdp-good' : 'border-rdp-text-faint hover:border-rdp-signal'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-rdp-text">{bill.name}</p>
                <p className="font-mono text-xs text-rdp-text-faint">
                  {bill.due_day_of_month ? `Due day ${bill.due_day_of_month}` : bill.due_date ?? 'No due date'}
                  {bill.category ? ` · ${bill.category}` : ''}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm tabular-nums text-rdp-text">${Number(bill.amount).toFixed(2)}</p>
              <button onClick={() => deleteBill(bill.id)} className="shrink-0 text-xs text-rdp-text-faint hover:text-rdp-risk">
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
