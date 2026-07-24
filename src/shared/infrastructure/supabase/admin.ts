import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!key || key.includes('placeholder')) {
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  }

  if (!key) {
    throw new Error('Supabase API Key environment variable is not defined.');
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
