import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CompanyCard from '@/components/CompanyCard';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, tierOneCount, unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function GeographyPage({ params }: { params: { slug: string } }) {
  const name = unslug(params.slug);
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('region', name)
    .order('priority_tier')
    .order('name');
  const companies = (data || []) as Company[];

  return (
    <AppShell>
      <div className="page-enter" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href="/geographies" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--brand)', textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Geographies
        </Link>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: '4px' }}>Geography</p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{name}</h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {companies.length} companies · Avg fit {avgFit(companies) || '—'} · {tierOneCount(companies)} Tier 1
          </p>
        </div>
        {companies.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            No companies in this region yet.
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
