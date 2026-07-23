/** Small helpers so every Function returns consistent JSON responses. */

/**
 * Bug fix: none of our responses set Cache-Control, which meant Netlify's
 * CDN or the browser could silently cache a dynamic response — the
 * likely cause of Horoscope (and potentially other endpoints) showing
 * the same content across different days despite the backend correctly
 * generating fresh content keyed by date. Every response now explicitly
 * says not to cache, since everything here is either per-user dynamic
 * data or has its own internal freshness logic (in-memory caches,
 * date-keyed DB rows) that should always be the one source of truth —
 * not an extra caching layer we don't control.
 */
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

/**
 * Extracts a usable message from any thrown value. Supabase's client
 * throws plain objects (PostgrestError: { message, details, hint, code })
 * rather than real Error instances, so `err instanceof Error` alone
 * missed those and silently showed "Unknown error" for every database
 * error — including the exact "relation does not exist" message that
 * would have immediately explained a missing migration.
 */
function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return 'Unknown error'
}

export function errorResponse(err: unknown, status = 500): Response {
  const message = extractMessage(err)
  // eslint-disable-next-line no-console
  console.error(message)
  return json({ error: message }, status)
}
