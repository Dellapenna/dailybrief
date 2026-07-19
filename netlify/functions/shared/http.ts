/** Small helpers so every Function returns consistent JSON responses. */

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(err: unknown, status = 500): Response {
  const message = err instanceof Error ? err.message : 'Unknown error'
  // eslint-disable-next-line no-console
  console.error(message)
  return json({ error: message }, status)
}
