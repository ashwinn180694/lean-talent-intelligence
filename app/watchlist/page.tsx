import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import WatchlistClient from '@/components/WatchlistClient';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';

export default async function WatchlistPage() {
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: watchlistRows } = await supabase
    .from('watchlists')
    .select('companies(*)')
    .eq('user_id', session.user.id);

  const companies: Company[] = (watchlistRows ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => (Array.isArray(row.companies) ? row.companies[0] : row.companies) as Company | null)
    .filter((c): c is Company => c !== null)
    .sort((a, b) => (b.lean_fit_score || 0) - (a.lean_fit_score || 0));

  return (
    <AppShell>
      <WatchlistClient companies={companies} userId={session.user.id} />
    </AppShell>
  );
}
