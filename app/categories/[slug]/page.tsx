import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CompanyCard from '@/components/CompanyCard';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, tierOneCount, unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const name = unslug(params.slug);
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('sub_sector', name)
    .order('priority_tier')
    .order('name');
  const companies = (data || []) as Company[];

  return (
    <AppShell>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#c47e3a', textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Categories
        </Link>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c47e3a', marginBottom: '4px' }}>Category</p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{name}</h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: '#9a9080' }}>
            {companies.length} companies · Avg fit {avgFit(companies) || '—'} · {tierOneCount(companies)} Tier 1
          </p>
        </div>
        {companies.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#9a9080' }}>
            No companies in this category yet.
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
