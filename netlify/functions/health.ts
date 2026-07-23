import type { Config, Context } from '@netlify/functions'

/**
 * Simple unauthenticated health check used to verify the Functions
 * pipeline deploys correctly. Not part of the product surface.
 */
export default async (_req: Request, _context: Context) => {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
  )
}

export const config: Config = {
  path: '/api/health',
}
