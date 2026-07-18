import { useEffect, useState } from 'react'

type Coords = { lat: number; lng: number }
type Status = 'idle' | 'loading' | 'ready' | 'denied' | 'unsupported'

/**
 * Browser Geolocation API, with a fallback the caller supplies (typically
 * user_preferences.location_lat/lng from Settings) for when permission is
 * denied or the API is unavailable — this is a web app, not a native iOS
 * app, so there's no background location access, only "ask when this page
 * is open."
 */
export function useGeolocation(fallback?: Coords | null) {
  const [coords, setCoords] = useState<Coords | null>(fallback ?? null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setStatus('ready')
      },
      () => {
        setStatus('denied')
        // coords stays at whatever fallback was passed in
      },
      { maximumAge: 10 * 60 * 1000, timeout: 8000 },
    )
    // Deliberately only runs once per mount — re-requesting on every
    // render would be both annoying (repeated permission checks) and
    // unnecessary (location doesn't need to update that often).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { coords, status }
}
