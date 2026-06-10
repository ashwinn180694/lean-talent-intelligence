import { createClient } from '@supabase/supabase-js';

export function getSupabaseForRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Supabase environment variables are missing.');
  const auth = request.headers.get('authorization') || '';
  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: auth ? { Authorization: auth } : {} }
  });
}
