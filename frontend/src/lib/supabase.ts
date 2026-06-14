import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether real Supabase credentials are present. When false, the app still
 * renders (landing, legal, and the free toolkit work) — only auth-dependent
 * features are unavailable. We deliberately do NOT throw at import time, since
 * that would crash the entire SPA and leave a blank screen.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

// Fall back to a syntactically valid placeholder so createClient never throws.
// Auth calls against the placeholder simply fail and are handled gracefully.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
