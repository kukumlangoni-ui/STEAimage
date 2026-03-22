import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when both env vars are present and the URL looks valid.
 * Gate all Supabase calls behind this flag so the app never crashes
 * when running without a backend configuration.
 */
export const isSupabaseConfigured: boolean =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.trim().length > 0 &&
  supabaseUrl.startsWith('https://') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.trim().length > 0;

// Real client — only created when properly configured
let _client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    _client = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (err) {
    console.error('[STEAimage] Failed to initialise Supabase client:', err);
  }
}

/**
 * Returns the Supabase client or throws a descriptive error.
 * Always gate calls behind isSupabaseConfigured.
 */
export function getSupabase(): SupabaseClient {
  if (!_client) {
    throw new Error(
      'SUPABASE_NOT_CONFIGURED: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'to your Vercel project → Settings → Environment Variables, then redeploy.'
    );
  }
  return _client;
}

/**
 * Direct nullable reference.
 * Will be null when env vars are missing/invalid.
 */
export const supabase: SupabaseClient | null = _client;
