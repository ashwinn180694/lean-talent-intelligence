import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import CompanyCard from '@/components/CompanyCard';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';

export default async function WatchlistPage() {
  const supabase = createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Join watchlists → companies for this user
  const { data: watchlistRows, error } = await supabase
    .from('watchlists')
    .select('companies(*)')
    .eq('user_id', userId);

  const companies: Company[] = (watchlistRows ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => (Array.isArray(row.companies) ? row.companies[0] : row.companies) as Company | null) 
    .filter((c): c is Company => c !== null);

  return (
    <AppShell>
      <div className="page-enter" style={{ padding: '28px 32px', maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            My Watchlist
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Companies you&apos;re tracking — click the heart on any company card to add or remove.
          </p>
        </div>

        {/* Empty state */}
        {companies.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            border: '1px dashed var(--border)',
            borderRadius: '12px',
            background: 'var(--card-bg)',
            gap: '12px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '36px', lineHeight: 1 }}>♡</span>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Your watchlist is empty
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '320px' }}>
              Browse the Companies page and click the heart icon on any card to start tracking companies.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {companies.length} {companies.length === 1 ? 'company' : 'companies'} tracked
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px',
            }}>
              {companies.map(company => (
                <CompanyCard key={company.id} company={company} isWatched={true} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
