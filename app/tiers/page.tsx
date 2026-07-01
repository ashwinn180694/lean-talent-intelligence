import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';

const TIERS = [
  {
    name: 'Tier 1',
    color: '#3DD68C',
    bg: 'rgba(61,214,140,0.08)',
    border: 'rgba(61,214,140,0.20)',
    blurb: 'Active sourcing targets — highest cultural fit and growth trajectory. Prioritize outreach here.',
  },
  {
    name: 'Tier 2',
    color: '#46B8D8',
    bg: 'rgba(70,184,216,0.06)',
    border: 'rgba(70,184,216,0.18)',
    blurb: 'Strong pipeline companies. Map key functions now and convert to Tier 1 as signals improve.',
  },
  {
    name: 'Tier 3',
    color: '#787F85',
    bg: 'rgba(120,127,133,0.06)',
    border: 'rgba(120,127,133,0.15)',
    blurb: 'Emerging pools and longlist. Monitor for hiring signals and tier up when relevant.',
  },
];

function fitColor(score: number) {
  if (score >= 9) return { color: '#3DD68C', bg: 'rgba(61,214,140,0.13)' };
  if (score >= 8) return { color: '#9AB654', bg: 'rgba(154,182,84,0.13)' };
  if (score >= 7) return { color: '#D6A35C', bg: 'rgba(214,163,92,0.13)' };
  if (score >= 5) return { color: '#787F85', bg: 'rgba(120,127,133,0.13)' };
  return { color: '#F26669', bg: 'rgba(242,102,105,0.13)' };
}

const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];
const CAT_LIST = ['Neobank','Payments','Lending','Insurance','WealthTech','Crypto / Digital Assets','RegTech','Open Banking','Remittance','Stablecoin','BaaS','BNPL'];
function catColor(cat?: string | null) {
  const i = CAT_LIST.indexOf(cat || '');
  return CAT_PALETTE[i >= 0 ? i % CAT_PALETTE.length : 0];
}

export default async function TiersPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('lean_fit_score', { ascending: false });
  const companies = (data || []) as Company[];
  const total = companies.length;

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-enter" style={{ padding: '28px 32px 40px' }}>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>Priority structure</p>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 600, color: 'var(--text-hi)' }}>Tiers</h1>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Every pool ranked by sourcing priority — open a column to map the full list
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
            {TIERS.map(({ name, color, bg, border, blurb }) => {
              const cos = companies.filter(c => c.priority_tier === name).sort((a, b) => (b.lean_fit_score || 0) - (a.lean_fit_score || 0));
              const avgFit = cos.length > 0 ? cos.reduce((s, c) => s + (c.lean_fit_score || 0), 0) / cos.length : 0;
              const cats = new Set(cos.map(c => c.sub_sector).filter(Boolean)).size;
              const pct = total > 0 ? Math.round((cos.length / total) * 100) : 0;

              return (
                <div key={name} style={{
                  background: 'var(--surface)', border: `1px solid ${border}`,
                  borderRadius: '12px', overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{
                    background: bg, padding: '18px 18px 16px', position: 'relative', overflow: 'hidden',
                    borderBottom: `1px solid ${border}`,
                  }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', pointerEvents: 'none', background: `radial-gradient(circle at top right, ${color}20, transparent 68%)` }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-hi)' }}>{name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: color, marginLeft: 'auto' }}>{pct}% of universe</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                      {[
                        { label: 'companies', value: cos.length },
                        { label: 'avg fit', value: avgFit.toFixed(1), colored: true },
                        { label: 'categories', value: cats },
                      ].map(({ label, value, colored }) => (
                        <div key={label}>
                          <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 500, color: colored ? color : 'var(--text-hi)', lineHeight: 1 }}>{value}</p>
                          <p style={{ margin: '3px 0 0', fontSize: '10.5px', color: '#5b6066' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: '4px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(avgFit * 10, 100)}%`, height: '100%', background: color, borderRadius: '99px' }} />
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{blurb}</p>
                  </div>

                  {/* Company list */}
                  <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
                    {cos.map(c => {
                      const fit = c.lean_fit_score || 0;
                      const fc = fitColor(fit);
                      const accent = catColor(c.sub_sector);
                      return (
                        <Link
                          key={c.id}
                          href={`/companies/${c.id}`}
                          className="tier-row"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 16px', textDecoration: 'none',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: accent, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#5b6066' }}>{c.region || '—'}</p>
                          </div>
                          {fit > 0 && (
                            <span className="fit-chip" style={{ background: fc.bg, color: fc.color, fontSize: '11px', flexShrink: 0 }}>{fit.toFixed(1)}</span>
                          )}
                        </Link>
                      );
                    })}
                    {cos.length === 0 && (
                      <p style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12.5px', color: '#5b6066', margin: 0 }}>No companies in this tier yet.</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                    <Link href={`/companies?tier=${encodeURIComponent(name)}`} style={{ fontSize: '12.5px', color: color, textDecoration: 'none' }}>
                      View all {name} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
