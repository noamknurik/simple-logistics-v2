import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * SERVER-ONLY client using the service role key. Never import this from a
 * client component — it bypasses Row Level Security entirely. Used only in
 * API routes for actions an org admin triggers (inviting a teammate,
 * provisioning a new org) that the anon-key client isn't allowed to do.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
