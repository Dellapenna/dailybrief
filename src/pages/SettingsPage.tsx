import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import Disclosure from '@/components/Disclosure'
import type { CalendarConnection, CalendarProvider } from '@/types/calendar'

type Preferences = {
  location_label: string | null
  location_lat: number | null
  location_lng: number | null
  weather_units: 'imperial' | 'metric'
  zodiac_sign: string | null
  daily_calorie_goal: number | null
}

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const

const zodiacLabels: Record<string, string> = {
  aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
  sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces',
}

const providerLabels: Record<CalendarProvider, string> = {
  icloud: 'iCloud Calendar',
  google: 'Google Calendar',
  outlook: 'Outlook / Microsoft 365',
  sports: 'Sports Schedule (display-only, not a real connection)',
}

function LocationSettings() {
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { coords, status } = useGeolocation()

  useEffect(() => {
    api
      .get<{ preferences: Preferences }>('/preferences')
      .then((res) => {
        setPrefs(res.preferences)
        setLabel(res.preferences.location_label ?? '')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load preferences'))
  }, [])

  async function useCurrentLocation() {
    if (!coords) return
    setSaving(true)
    try {
      const res = await api.patch<{ preferences: Preferences }>('/preferences', {
        locationLat: coords.lat,
        locationLng: coords.lng,
        locationLabel: label || null,
      })
      setPrefs(res.preferences)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Disclosure title="Home Location" subtitle="Used for weather when browser location isn't available" defaultOpen>
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Decatur, IN"
          className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
        />
        <button
          onClick={useCurrentLocation}
          disabled={!coords || saving || status === 'loading'}
          className="rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Use current location'}
        </button>
      </div>

      {prefs?.location_lat != null && prefs?.location_lng != null && (
        <p className="mt-2 text-xs text-rdp-text-faint">
          Saved: {prefs.location_lat.toFixed(3)}, {prefs.location_lng.toFixed(3)}
        </p>
      )}
      {status === 'denied' && (
        <p className="mt-2 text-xs text-rdp-text-faint">Location access denied — grant it in your browser/iPhone settings to use this.</p>
      )}
    </Disclosure>
  )
}

function HoroscopeSettings() {
  const [sign, setSign] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ preferences: Preferences }>('/preferences')
      .then((res) => setSign(res.preferences.zodiac_sign ?? ''))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load preferences'))
  }, [])

  async function handleChange(value: string) {
    setSign(value)
    setSaving(true)
    setError(null)
    try {
      await api.patch('/preferences', { zodiacSign: value || null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Disclosure title="Horoscope" subtitle="For fun — set your sign to see it on Mission Control">
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <select
        value={sign}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
      >
        <option value="">Not set</option>
        {zodiacSigns.map((z) => (
          <option key={z} value={z}>
            {zodiacLabels[z]}
          </option>
        ))}
      </select>
    </Disclosure>
  )
}

type SportsTeam = { id: string; team_name: string }

function CalorieSettings() {
  const [goal, setGoal] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ preferences: Preferences }>('/preferences')
      .then((res) => setGoal(res.preferences.daily_calorie_goal?.toString() ?? ''))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load preferences'))
  }, [])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await api.patch('/preferences', { dailyCalorieGoal: goal ? Number(goal) : null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Disclosure title="Daily Calorie Goal" subtitle="Used by the Calorie Counter on Body">
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}
      <div className="flex gap-2">
        <input
          type="number"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. 2200"
          className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Disclosure>
  )
}

type StockPref = { id: string; symbol: string; label: string | null }

function StockSettings() {
  const [stocks, setStocks] = useState<StockPref[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api
      .get<{ stocks: StockPref[] }>('/stock-preferences')
      .then((res) => setStocks(res.stocks))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stocks'))
  }

  useEffect(load, [])

  async function addStock(e: FormEvent) {
    e.preventDefault()
    const symbol = newSymbol.trim()
    if (!symbol) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/stock-preferences', { symbol })
      setNewSymbol('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add symbol')
    } finally {
      setSaving(false)
    }
  }

  async function removeStock(id: string) {
    setStocks((prev) => prev.filter((s) => s.id !== id))
    try {
      await api.delete(`/stock-preferences/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove symbol')
      load()
    }
  }

  return (
    <Disclosure title="Stock Watchlist" subtitle="Drives Stock Market on Daily Dashboard">
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <form onSubmit={addStock} className="flex gap-2">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="e.g. AAPL"
          className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <p className="mt-1.5 text-xs text-rdp-text-faint">Use the ticker symbol (e.g. "AAPL", not "Apple").</p>

      <div className="mt-3 space-y-2">
        {stocks.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-sm">
            <span className="text-rdp-text">{s.label || s.symbol}</span>
            <button onClick={() => removeStock(s.id)} className="text-xs text-rdp-text-faint hover:text-rdp-risk">
              Remove
            </button>
          </div>
        ))}
        {stocks.length === 0 && <p className="text-sm text-rdp-text-faint">No symbols in your watchlist.</p>}
      </div>
    </Disclosure>
  )
}

type CryptoPref = { id: string; coin_id: string; label: string }
type CryptoSearchResult = { id: string; name: string; symbol: string }

function CryptoSettings() {
  const [coins, setCoins] = useState<CryptoPref[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CryptoSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api
      .get<{ coins: CryptoPref[] }>('/crypto-preferences')
      .then((res) => setCoins(res.coins))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load coins'))
  }

  useEffect(load, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const id = setTimeout(() => {
      setSearching(true)
      api
        .get<{ results: CryptoSearchResult[] }>(`/crypto-search?q=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.results))
        .catch((err) => setError(err instanceof Error ? err.message : 'Search failed'))
        .finally(() => setSearching(false))
    }, 400)
    return () => clearTimeout(id)
  }, [query])

  async function addCoin(result: CryptoSearchResult) {
    setError(null)
    try {
      await api.post('/crypto-preferences', { coinId: result.id, label: result.name })
      setQuery('')
      setResults([])
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add coin')
    }
  }

  async function removeCoin(id: string) {
    setCoins((prev) => prev.filter((c) => c.id !== id))
    try {
      await api.delete(`/crypto-preferences/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove coin')
      load()
    }
  }

  return (
    <Disclosure title="Crypto Watchlist" subtitle="Drives Crypto Market on Daily Dashboard">
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a coin (e.g. dogecoin)"
        className="w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
      />
      {searching && <p className="mt-1 text-xs text-rdp-text-faint">Searching…</p>}
      {results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => addCoin(r)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-rdp-text hover:bg-rdp-void"
            >
              <span>
                {r.name} <span className="text-rdp-text-faint">({r.symbol})</span>
              </span>
              <span className="text-xs text-rdp-signal">Add</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {coins.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <span className="text-rdp-text">{c.label}</span>
            <button onClick={() => removeCoin(c.id)} className="text-xs text-rdp-text-faint hover:text-rdp-risk">
              Remove
            </button>
          </div>
        ))}
        {coins.length === 0 && <p className="text-sm text-rdp-text-faint">No coins in your watchlist.</p>}
      </div>
    </Disclosure>
  )
}

function SportsSettings() {
  const [teams, setTeams] = useState<SportsTeam[]>([])
  const [newTeam, setNewTeam] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api
      .get<{ teams: SportsTeam[] }>('/sports-preferences')
      .then((res) => setTeams(res.teams))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load teams'))
  }

  useEffect(load, [])

  async function addTeam(e: FormEvent) {
    e.preventDefault()
    const name = newTeam.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/sports-preferences', { teamName: name })
      setNewTeam('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team')
    } finally {
      setSaving(false)
    }
  }

  async function removeTeam(id: string) {
    setTeams((prev) => prev.filter((t) => t.id !== id))
    try {
      await api.delete(`/sports-preferences/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team')
      load()
    }
  }

  return (
    <Disclosure title="Favorite Teams" subtitle="Drives Sports schedule + scores on Daily Dashboard">
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <form onSubmit={addTeam} className="flex gap-2">
        <input
          type="text"
          value={newTeam}
          onChange={(e) => setNewTeam(e.target.value)}
          placeholder="e.g. Philadelphia Eagles"
          className="flex-1 rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <p className="mt-1.5 text-xs text-rdp-text-faint">
        Use the team's full name as it'd appear on TheSportsDB (e.g. "Philadelphia Eagles", not "Eagles") for the
        best match.
      </p>

      <div className="mt-3 space-y-2">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <span className="text-rdp-text">{t.team_name}</span>
            <button onClick={() => removeTeam(t.id)} className="text-xs text-rdp-text-faint hover:text-rdp-risk">
              Remove
            </button>
          </div>
        ))}
        {teams.length === 0 && <p className="text-sm text-rdp-text-faint">No favorite teams set.</p>}
      </div>
    </Disclosure>
  )
}

function CalendarSettings() {
  const [connections, setConnections] = useState<CalendarConnection[]>([])
  const [syncingProvider, setSyncingProvider] = useState<CalendarProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [redirectMessage, setRedirectMessage] = useState<{ text: string; success: boolean } | null>(null)

  function load() {
    api
      .get<{ connections: CalendarConnection[] }>('/calendar/connections')
      .then((res) => setConnections(res.connections))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load connections'))
  }

  useEffect(load, [])

  // After the Google OAuth redirect completes, calendar-oauth-google-callback.ts
  // sends the result back as query params rather than a bare JSON response.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const message = params.get('calendarMessage')
    if (message) {
      setRedirectMessage({ text: message, success: params.get('calendarSuccess') === 'true' })
      params.delete('calendarMessage')
      params.delete('calendarSuccess')
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  async function sync(provider: 'icloud' | 'google') {
    setSyncingProvider(provider)
    setError(null)
    try {
      await api.post(`/calendar/sync/${provider}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncingProvider(null)
    }
  }

  const statusFor = (provider: CalendarProvider) => connections.find((c) => c.provider === provider)

  return (
    <Disclosure title="Calendars" subtitle="iCloud and Google live now, Outlook not yet connected" defaultOpen>
      {redirectMessage && (
        <p className={`mb-2 text-sm ${redirectMessage.success ? 'text-rdp-good' : 'text-rdp-risk'}`}>
          {redirectMessage.text}
        </p>
      )}
      {error && <p className="mb-2 text-sm text-rdp-risk">{error}</p>}

      <div className="space-y-3">
        {(['icloud', 'google', 'outlook'] as const).map((provider) => {
          const conn = statusFor(provider)
          const connected = conn?.status === 'connected' || conn?.status === 'error'
          return (
            <div key={provider} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-rdp-text">{providerLabels[provider]}</p>
                <p className="text-xs text-rdp-text-faint">
                  {conn?.status === 'connected' && conn.last_synced_at
                    ? `Last synced ${new Date(conn.last_synced_at).toLocaleString()}`
                    : conn?.status === 'error'
                      ? `Error: ${conn.last_error}`
                      : provider === 'icloud'
                        ? 'Not connected yet — set ICLOUD_APPLE_ID / ICLOUD_APP_SPECIFIC_PASSWORD, see docs/INTEGRATIONS.md'
                        : provider === 'google'
                          ? 'Not connected yet — tap Connect'
                          : 'Not implemented yet — requires OAuth app registration, see docs/INTEGRATIONS.md'}
                </p>
              </div>
              {(provider === 'icloud' || provider === 'google') &&
                (provider === 'google' && !connected ? (
                  <a
                    href="/api/calendar/oauth/google/start"
                    className="rounded-lg border border-rdp-line px-3 py-1.5 text-xs font-medium text-rdp-text hover:bg-rdp-void"
                  >
                    Connect
                  </a>
                ) : (
                  <button
                    onClick={() => sync(provider)}
                    disabled={syncingProvider === provider}
                    className="rounded-lg border border-rdp-line px-3 py-1.5 text-xs font-medium text-rdp-text hover:bg-rdp-void disabled:opacity-50"
                  >
                    {syncingProvider === provider ? 'Syncing…' : 'Sync now'}
                  </button>
                ))}
            </div>
          )
        })}
      </div>
    </Disclosure>
  )
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Settings</h1>
      <div className="mt-5 space-y-3">
        <LocationSettings />
        <CalorieSettings />
        <HoroscopeSettings />
        <StockSettings />
        <CryptoSettings />
        <SportsSettings />
        <CalendarSettings />
      </div>
    </div>
  )
}
