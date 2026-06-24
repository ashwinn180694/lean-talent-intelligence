import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CompanyCard from '@/components/CompanyCard';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, tierOneCount, unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];
const CAT_LIST = ['Neobank','Payments','Lending','Insurance','WealthTech','Crypto / Digital Assets','RegTech','Open Banking','Remittance','Stablecoin','BaaS','BNPL'];
function catColor(cat: string) {
  const i = CAT_LIST.indexOf(cat);
  return CAT_PALETTE[i >= 0 ? i % CAT_PALETTE.length : 0];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const name = unslug(params.slug);
  const accent = catColor(name);
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('sub_sector', name)
    .order('lean_fit_score', { ascending: false });
  const companies = (data || []) as Company[];
  const t1 = companies.filter(c => c.priority_tier === 'Tier 1').length;
  const t2 = companies.filter(c => c.priority_tier === 'Tier 2').length;
  const t3 = companies.filter(c => c.priority_tier === 'Tier 3').length;

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-enter" style={{ padding: '28px 32px 40px' }}>

          {/* Back */}
          <Link
            href="/categories"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#787F85', textDecoration: 'none', marginBottom: '20px', transition: 'color 0.12s' }}
          >
            <ArrowLeft size={13} /> Categories
          </Link>

          {/* Header card */}
          <div style={{
            background: '#212329', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', overflow: 'hidden', marginBottom: '24px',
            position: 'relative',
          }}>
            <div style={{ height: '4px', background: accent }} />
            <div style={{
              position: 'absolute', top: 4, right: 0, width: '160px', height: '100px',
              background: `radial-gradient(circle at top right, ${accent}20, transparent 68%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ padding: '20px 24px 22px' }}>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Category</p>
              <h1 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 600, color: '#EDEEF0' }}>{name}</h1>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'companies', value: companies.length },
                  { label: 'avg fit', value: avgFit(companies) || '—', colored: true },
                  { label: 'Tier 1', value: t1 },
                ].map(({ label, value, colored }) => (
                  <div key={label}>
                    <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 500, color: colored ? accent : '#EDEEF0', lineHeight: 1 }}>{value}</p>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#5b6066' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Tier bar */}
              {companies.length > 0 && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(t1/companies.length)*100}%`, background: '#3DD68C' }} />
                    <div style={{ width: `${(t2/companies.length)*100}%`, background: '#46B8D8' }} />
                    <div style={{ width: `${(t3/companies.length)*100}%`, background: '#5b6066' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    {[['T1', t1, '#3DD68C'], ['T2', t2, '#46B8D8'], ['T3', t3, '#5b6066']].map(([l, n, c]) => (
                      <span key={l as string} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: c as string }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', color: '#787F85' }}>{l} {n}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Company grid */}
          {companies.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#5b6066', background: '#212329', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.07)' }}>
              No companies in this category yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {companies.map(c => <CompanyCard key={c.id} company={c} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
