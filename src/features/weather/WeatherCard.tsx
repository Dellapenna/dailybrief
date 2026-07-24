import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { WeatherResponse, WeatherPeriod } from '@/types/weather'

/** Pairs consecutive day/night periods into one forecast-day row each. */
function pairIntoDays(periods: WeatherPeriod[]): { label: string; high: number | null; low: number | null; precip: number | null; forecast: string }[] {
  const days: { label: string; high: number | null; low: number | null; precip: number | null; forecast: string }[] = []
  for (let i = 0; i < periods.length; i += 2) {
    const a = periods[i]
    const b = periods[i + 1]
    const day = a?.isDaytime ? a : b?.isDaytime ? b : a
    const night = !a?.isDaytime ? a : !b?.isDaytime ? b : b
    if (!day && !night) continue
    days.push({
      label: (day ?? night)?.name.replace(' Night', '') ?? '',
      high: day?.temperature ?? null,
      low: night?.temperature ?? null,
      precip: day?.probabilityOfPrecipitation?.value ?? night?.probabilityOfPrecipitation?.value ?? null,
      forecast: (day ?? night)?.shortForecast ?? '',
    })
  }
  return days
}

/**
 * Uses the browser's location if granted, otherwise falls back to the
 * stored home location from Settings — see useGeolocation.
 *
 * The backend was already fetching high/low, precipitation chance, and
 * several days of forecast from NWS — this just surfaces it. Previously
 * only showed today's single temperature + short forecast text.
 */
export default function WeatherCard({ fallbackLocation }: { fallbackLocation?: { lat: number; lng: number } | null }) {
  const { coords, status: geoStatus } = useGeolocation(fallbackLocation)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!coords) return
    setLoading(true)
    setError(null)
    api
      .get<WeatherResponse>(`/weather?lat=${coords.lat}&lng=${coords.lng}`)
      .then(setWeather)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load weather'))
      .finally(() => setLoading(false))
  }, [coords])

  const upcomingDays = weather ? pairIntoDays(weather.upcoming) : []

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">Weather</p>

      {!coords && geoStatus !== 'loading' && (
        <p className="mt-2 text-sm text-rdp-text-dim">
          No location available — allow location access or set a home location in Settings.
        </p>
      )}
      {loading && <Skeleton lines={2} className="mt-2" />}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}

      {weather?.today && (
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-2xl font-semibold tabular-nums text-rdp-text">
              {weather.today.temperature}°{weather.today.temperatureUnit}
            </p>
            {weather.tonight && (
              <p className="font-mono text-sm tabular-nums text-rdp-text-faint">
                / {weather.tonight.temperature}°{weather.tonight.temperatureUnit}
              </p>
            )}
            {typeof weather.today.probabilityOfPrecipitation?.value === 'number' &&
              weather.today.probabilityOfPrecipitation.value > 0 && (
                <p className="font-mono text-sm text-sky-400">
                  💧 {weather.today.probabilityOfPrecipitation.value}%
                </p>
              )}
          </div>
          <p className="text-sm text-rdp-text-dim">{weather.today.shortForecast}</p>
          {weather.location && <p className="mt-1 text-xs text-rdp-text-faint">{weather.location}</p>}

          {upcomingDays.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-rdp-line pt-3 sm:grid-cols-4">
              {upcomingDays.map((d, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs font-medium text-rdp-text-dim">{d.label}</p>
                  <p className="mt-1 font-mono text-sm tabular-nums text-rdp-text">
                    {d.high ?? '—'}° <span className="text-rdp-text-faint">/ {d.low ?? '—'}°</span>
                  </p>
                  {typeof d.precip === 'number' && d.precip > 0 && (
                    <p className="font-mono text-xs text-sky-400">💧{d.precip}%</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
