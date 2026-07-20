/** Small helpers so every Function returns consistent JSON responses. */

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
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
