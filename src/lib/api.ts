/**
 * Thin fetch wrapper for calling this app's own Netlify Functions
 * (proxied through /api/* — see netlify.toml). The browser never talks to
 * Supabase directly in this instance: there's no per-user session to
 * scope a client-side key to, since access control is handled entirely by
 * Netlify Password Protection at the site level. All persistence goes
 * through server-side Functions using the service-role key instead — see
 * netlify/functions/shared/supabaseAdmin.ts and docs/ARCHITECTURE.md.
 */

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
