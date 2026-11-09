import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The publishable key is designed to be public: Row Level Security in the database
// decides what each visitor can read or write. Never put the secret/service key here.
const URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_DsgrdpIRi7RHuOwtqi6RWw_vC7uRw91';

export const supabase: SupabaseClient | null = (() => {
  try {
    return createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
  } catch {
    return null; // e.g. storage blocked in a sandboxed preview
  }
})();
