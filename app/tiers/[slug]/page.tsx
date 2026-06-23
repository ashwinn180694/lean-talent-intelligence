import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CompanyCard from '@/components/CompanyCard';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  'Tier 1': { bg: '#fef7ed', color: '#c47e3a' },
  'Tier 2': { bg: '#eff6ff', color: '#2563eb' },
  'Tier 3': { bg: '#f8f7f4', color: '#9a9080' }
};

export default async function TierPage({ params }: { params: { slug: string } }) {
  const name = unslug(params.slug);
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('priority_tier', name)
    .order('lean_fit_score', { ascending: false })
    .order('name');
  const companies = (data || []) as Company[];
  const style = TIER_STYLES[name] ?? { bg: '#f8f7f4', color: '#9a9080' };

  return (
    <AppShell>
      <div className="page-enter" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href="/tiers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--brand)', textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Tiers
        </Link>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: '4px' }}>Priority tier</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{name}</h1>
            <span style={{ ...style, borderRadius: '99px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>{companies.length}</span>
          </div>
          <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {companies.length} companies · Avg fit {avgFit(companies) || '—'}
          </p>
        </div>
        {companies.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            No companies in this tier yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {companies.map(c => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
