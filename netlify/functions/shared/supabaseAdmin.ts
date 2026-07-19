import { createClient } from '@supabase/supabase-js'
import { requireEnv } from './env'

/**
 * Admin Supabase client using the service-role key.
 * ONLY import this inside Netlify Functions — never in src/.
 * The service-role key bypasses row-level security.
 */
export function getSupabaseAdmin() {
  const url = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
