import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Skeleton from '@/components/Skeleton'
import type { BudgetCategory } from '@/types/banking'

/**
 * "Actual" spending is computed live from the register's own category
 * field this month — no separate expense entry, one source of truth.
 * Tag transactions with a category in the Register to see it show up
 * here.
 */
export default function BudgetCard() {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')

  function load() {
    setLoading(true)
    api
      .get<{ categories: BudgetCategory[] }>('/budget')
      .then((res) => setCategories(res.categories))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load budget'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function addCategory() {
    const amt = Number(budget)
    if (!name.trim() || !amt) return
    try {
      await api.post('/budget', { categoryName: name.trim(), monthlyBudget: amt })
      setName('')
      setBudget('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    }
  }

  async function deleteCategory(id: string) {
    if (!window.confirm('Delete this budget category?')) return
    try {
      await api.delete(`/budget/${id}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Add Budget Category</p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category (e.g. Groceries)"
            className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget"
            className="w-28 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
        </div>
        <button onClick={addCategory} className="mt-2 w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {loading ? (
          <Skeleton lines={3} />
        ) : categories.length === 0 ? (
          <p className="rounded-xl border border-rdp-line bg-rdp-panel py-4 text-center text-sm text-rdp-text-faint">
            No budget categories yet — add one above, then tag Register transactions with a matching category.
          </p>
        ) : (
          categories.map((c) => {
            const pct = c.monthly_budget > 0 ? Math.min(100, Math.round((c.spentThisMonth / c.monthly_budget) * 100)) : 0
            const over = c.spentThisMonth > c.monthly_budget
            return (
              <div key={c.id} className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-rdp-text">{c.category_name}</p>
                  <button onClick={() => deleteCategory(c.id)} className="text-xs text-rdp-text-faint hover:text-rdp-risk">
                    Delete
                  </button>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <p className={`font-mono text-sm tabular-nums ${over ? 'text-rdp-risk' : 'text-rdp-text-dim'}`}>
                    ${c.spentThisMonth.toFixed(2)}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-rdp-text-faint">of ${Number(c.monthly_budget).toFixed(2)}</p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rdp-line">
                  <div
                    className={`h-full rounded-full ${over ? 'bg-rdp-risk' : 'bg-rdp-signal'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
