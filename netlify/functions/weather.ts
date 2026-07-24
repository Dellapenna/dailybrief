import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * /api/weather?lat=..&lng=..
 *
 * Uses the US National Weather Service API (api.weather.gov) — free, no
 * API key, no rate-limit headaches for a single user. Good fit since this
 * instance's primary user is US-based. If this ever needs non-US
 * coverage, swap this one function for a keyed provider (OpenWeatherMap
 * etc.) — nothing else in the app depends on which provider is used.
 *
 * NWS requires a descriptive User-Agent identifying the app + a contact
 * method — not a secret, but still read from env so it's not hardcoded
 * project-specific info in source.
 */

const NWS_USER_AGENT = process.env.NWS_USER_AGENT || 'RDP 2.0 personal app (contact: not-set)'

export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url)
    const lat = url.searchParams.get('lat')
    const lng = url.searchParams.get('lng')

    if (!lat || !lng) {
      return json({ error: 'lat and lng query params are required' }, 400)
    }

    // Step 1: resolve lat/lng to the NWS grid endpoint for that point.
    const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lng}`, {
      headers: { 'User-Agent': NWS_USER_AGENT, Accept: 'application/geo+json' },
    })
    if (!pointsRes.ok) {
      return json(
        { error: `NWS points lookup failed (${pointsRes.status}). Is this location in the US?` },
        pointsRes.status,
      )
    }
    const points = await pointsRes.json()
    const forecastUrl: string | undefined = points?.properties?.forecast
    const locationLabel: string | undefined = points?.properties?.relativeLocation?.properties?.city

    if (!forecastUrl) {
      return json({ error: 'NWS did not return a forecast URL for this location' }, 502)
    }

    // Step 2: fetch the actual forecast.
    const forecastRes = await fetch(forecastUrl, {
      headers: { 'User-Agent': NWS_USER_AGENT, Accept: 'application/geo+json' },
    })
    if (!forecastRes.ok) {
      return json({ error: `NWS forecast fetch failed (${forecastRes.status})` }, forecastRes.status)
    }
    const forecast = await forecastRes.json()
    const periods = forecast?.properties?.periods ?? []

    return json({
      location: locationLabel ?? null,
      fetchedAt: new Date().toISOString(),
      source: 'National Weather Service',
      today: periods[0] ?? null,
      tonight: periods[1] ?? null,
      upcoming: periods.slice(2, 8), // ~3 more days (day+night pairs)
    })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/weather',
}
