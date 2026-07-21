import { useEffect, useState, lazy, Suspense } from 'react'
import { Camera } from 'lucide-react'
import { api } from '@/lib/api'
import { useFoodLog } from './useFoodLog'
import type { FoodSearchResult, Meal } from '@/types/foodLog'

// Lazy-loaded: ZXing (the barcode-decoding library) is large, and most
// visits to this card never open the scanner — loading it eagerly would
// add real weight to every page that renders CalorieCounterCard.
const BarcodeScanner = lazy(() => import('./BarcodeScanner'))

const MEALS: { value: Meal; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

export default function CalorieCounterCard() {
  const { logs, totalCalories, dailyCalorieGoal, loading, error, addEntry, deleteEntry } = useFoodLog()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<FoodSearchResult | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [meal, setMeal] = useState<Meal>('snack')
  const [scanning, setScanning] = useState(false)

  const [manualName, setManualName] = useState('')
  const [manualCalories, setManualCalories] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const id = setTimeout(() => {
      setSearching(true)
      setSearchError(null)
      api
        .get<{ results: FoodSearchResult[] }>(`/food-search?q=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.results))
        .catch((err) => setSearchError(err instanceof Error ? err.message : 'Search failed'))
        .finally(() => setSearching(false))
    }, 400)
    return () => clearTimeout(id)
  }, [query])

  async function handleBarcodeDetected(code: string) {
    setScanning(false)
    setSearchError(null)
    setSearching(true)
    try {
      const res = await api.get<{ result: FoodSearchResult }>(`/food-barcode?code=${encodeURIComponent(code)}`)
      setSelected(res.result)
      setQuery('')
      setResults([])
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Barcode lookup failed')
    } finally {
      setSearching(false)
    }
  }

  async function logSelected() {
    if (!selected) return
    const q = Number(quantity) || 1
    await addEntry({
      foodName: selected.description,
      calories: selected.calories,
      meal,
      quantity: q,
      proteinG: selected.proteinG,
      carbsG: selected.carbsG,
      fatG: selected.fatG,
      fdcId: selected.fdcId,
    })
    setSelected(null)
    setQuery('')
    setResults([])
    setQuantity('1')
  }

  async function logManual() {
    const cal = Number(manualCalories)
    if (!manualName.trim() || !cal) return
    await addEntry({ foodName: manualName.trim(), calories: cal, meal })
    setManualName('')
    setManualCalories('')
  }

  const pct = dailyCalorieGoal ? Math.min(100, Math.round((totalCalories / dailyCalorieGoal) * 100)) : null

  return (
    <div>
      {scanning && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
              <p className="text-sm text-white">Loading scanner…</p>
            </div>
          }
        >
          <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScanning(false)} />
        </Suspense>
      )}

      <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-2xl font-semibold tabular-nums text-rdp-text">{Math.round(totalCalories)}</p>
          {dailyCalorieGoal && (
            <p className="font-mono text-sm tabular-nums text-rdp-text-faint">/ {dailyCalorieGoal} cal</p>
          )}
        </div>
        {pct !== null && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rdp-line">
            <div
              className={`h-full rounded-full ${pct >= 100 ? 'bg-rdp-risk' : 'bg-rdp-signal'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {!dailyCalorieGoal && (
          <p className="mt-1 text-xs text-rdp-text-faint">Set a daily calorie goal in Settings to track against.</p>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
            Search Food Database
          </p>
          <button
            onClick={() => setScanning(true)}
            className="flex items-center gap-1 rounded-lg border border-rdp-line px-2 py-1 text-xs text-rdp-signal hover:bg-rdp-void"
          >
            <Camera className="h-3.5 w-3.5" />
            Scan barcode
          </button>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
          }}
          placeholder="e.g. grilled chicken breast"
          className="mt-2 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        {searching && <p className="mt-2 text-xs text-rdp-text-faint">Searching…</p>}
        {searchError && <p className="mt-2 text-xs text-rdp-risk">{searchError}</p>}

        {!selected && results.length > 0 && (
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.fdcId}
                onClick={() => setSelected(r)}
                className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-rdp-text hover:bg-rdp-void"
              >
                {r.description}
                <span className="ml-2 font-mono text-xs text-rdp-text-faint">{Math.round(r.calories)} cal</span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-3 space-y-2 rounded-lg border border-rdp-line-bright p-3">
            <p className="text-sm text-rdp-text">{selected.description}</p>
            <p className="font-mono text-xs text-rdp-text-faint">{Math.round(selected.calories)} cal (base)</p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Qty"
                className="w-20 rounded-lg border border-rdp-line bg-rdp-void px-2 py-1.5 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              />
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value as Meal)}
                className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-2 py-1.5 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              >
                {MEALS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <button onClick={logSelected} className="rounded-lg bg-rdp-signal px-3 py-1.5 text-sm font-medium text-white">
                Log
              </button>
            </div>
            <p className="text-xs text-rdp-text-faint">
              Quantity is a simple multiplier (e.g. 1.5 = 1.5x the base amount), not an exact gram recalculation.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel p-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
          Or Log Manually
        </p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Food name"
            className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
          <input
            type="number"
            value={manualCalories}
            onChange={(e) => setManualCalories(e.target.value)}
            placeholder="Cal"
            className="w-20 rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value as Meal)}
            className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-2 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
          >
            {MEALS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button onClick={logManual} className="rounded-lg bg-rdp-signal px-4 py-2 text-sm font-medium text-white">
            Log it
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Nothing logged today yet.</p>
        ) : (
          MEALS.map((m) => {
            const mealLogs = logs.filter((l) => l.meal === m.value)
            if (mealLogs.length === 0) return null
            return (
              <div key={m.value} className="border-b border-rdp-line py-2 last:border-b-0">
                <p className="text-xs font-medium uppercase tracking-wide text-rdp-amber">{m.label}</p>
                {mealLogs.map((log) => (
                  <div key={log.id} className="group mt-1 flex items-center justify-between">
                    <span className="text-sm text-rdp-text">
                      {log.food_name}
                      {log.quantity !== 1 && <span className="text-rdp-text-faint"> ×{log.quantity}</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums text-rdp-text-faint">
                        {Math.round(log.calories * log.quantity)} cal
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove "${log.food_name}"?`)) deleteEntry(log.id)
                        }}
                        className="text-xs text-rdp-text-faint hover:text-rdp-risk"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
