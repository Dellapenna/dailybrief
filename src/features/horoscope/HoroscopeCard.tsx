import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'

type HoroscopeResponse = { sign: string; date: string; content: string; cached: boolean }

const signLabels: Record<string, string> = {
  aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
  sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces',
}

export default function HoroscopeCard() {
  const [horoscope, setHoroscope] = useState<HoroscopeResponse | null>(null)
  const [needsSign, setNeedsSign] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<HoroscopeResponse>('/horoscope')
      .then(setHoroscope)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 400) {
          setNeedsSign(true)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load horoscope')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">Horoscope · for fun</p>

      {loading && <p className="mt-2 text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      {needsSign && (
        <p className="mt-2 text-sm text-rdp-text-dim">
          Set your zodiac sign in{' '}
          <Link to="/settings" className="text-rdp-signal">
            Settings
          </Link>{' '}
          to see this.
        </p>
      )}

      {horoscope && (
        <div className="mt-2">
          <p className="text-sm font-medium text-rdp-text">{signLabels[horoscope.sign] ?? horoscope.sign}</p>
          <p className="mt-1 text-sm text-rdp-text-dim">{horoscope.content}</p>
        </div>
      )}
    </div>
  )
}
