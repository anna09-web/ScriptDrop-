import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Admin Supabase client backed by the service role key.
 * This bypasses RLS, so it must NEVER be exposed to the browser and must only
 * be used inside trusted, authenticated request handlers.
 */
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
