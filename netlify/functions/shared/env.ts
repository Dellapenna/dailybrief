/**
 * Central place to read + validate server-side environment variables.
 * Every Netlify Function should read secrets through here rather than
 * `process.env` directly, so a missing variable fails fast and clearly
 * instead of causing a confusing downstream error.
 */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}
