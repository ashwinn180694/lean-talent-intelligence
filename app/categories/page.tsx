import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, MARKET_CATEGORIES, tierOneCount, topCompanies } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function CategoriesPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const groups = MARKET_CATEGORIES.map(cat => ({
    name: cat,
    companies: companies.filter(c => (c.sub_sector || 'Global Fintech') === cat)
  })).filter(g => g.companies.length > 0);

  return (
    <AppShell>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c47e3a', marginBottom: '4px' }}>Market map</p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Categories</h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: '#9a9080' }}>{groups.length} active categories across {companies.length} companies.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {groups.map(({ name, companies: rows }) => {
            const preview = topCompanies(rows, 4);
            return (
              <Link
                key={name}
                href={`/categories/${encodeURIComponent(name)}`}
                style={{
                  display: 'block', background: '#fff', border: '1px solid #e8e6e0',
                  borderRadius: '10px', padding: '18px', textDecoration: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(196,126,58,0.4)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(196,126,58,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e8e6e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{name}</h2>
                  <span style={{ background: 'rgba(196,126,58,0.1)', color: '#c47e3a', borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 500 }}>{rows.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#9a9080', marginBottom: '12px' }}>
                  <span>Avg fit <strong style={{ color: '#5a5650' }}>{avgFit(rows) || '—'}</strong></span>
                  <span>Tier 1 <strong style={{ color: '#5a5650' }}>{tierOneCount(rows)}</strong></span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {preview.map(c => (
                    <div key={c.id} style={{ fontSize: '11.5px', color: '#9a9080', background: '#f8f7f4', borderRadius: '5px', padding: '3px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                  ))}
                  {rows.length > 4 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#c47e3a' }}>
                      +{rows.length - 4} more <ArrowRight size={10} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
