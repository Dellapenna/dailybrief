import { requireEnv } from './env'

/**
 * This instance has exactly one user, seeded by
 * supabase/migrations/0001_init_profiles_and_pillars.sql with a fixed
 * UUID. Every Function scopes its queries to this id instead of reading
 * an auth session (there isn't one — see docs/ARCHITECTURE.md).
 */
export function getPrimaryUserId(): string {
  return requireEnv('PRIMARY_USER_ID')
}
