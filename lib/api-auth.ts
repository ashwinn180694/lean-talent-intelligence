import { createClient } from '@supabase/supabase-js';

export async function requireLeanUser(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return { ok: false as const, status: 401, error: 'Missing Supabase auth token.' };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: false as const, status: 500, error: 'Supabase environment variables are missing.' };

  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return { ok: false as const, status: 401, error: 'Invalid Supabase session.' };
  if (!data.user.email.endsWith('@leantech.me')) return { ok: false as const, status: 403, error: 'Only Lean users can access Ashby integration.' };
  return { ok: true as const, email: data.user.email };
}
