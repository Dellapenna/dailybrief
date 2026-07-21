import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { WeatherResponse } from '@/types/weather'

/**
 * Uses the browser's location if granted, otherwise falls back to the
 * stored home location from Settings — see useGeolocation.
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
          <p className="font-mono text-2xl font-semibold tabular-nums text-rdp-text">{weather.today.temperature}°{weather.today.temperatureUnit}</p>
          <p className="text-sm text-rdp-text-dim">{weather.today.shortForecast}</p>
          {weather.location && <p className="mt-1 text-xs text-rdp-text-faint">{weather.location}</p>}
        </div>
      )}
    </div>
  )
}
