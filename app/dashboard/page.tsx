import Link from 'next/link';
import { Building2, Star, Gauge, Target, AlertCircle, ArrowRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';

function fitColor(score: number) {
  if (score >= 9) return { color: '#3DD68C', bg: 'rgba(61,214,140,0.13)' };
  if (score >= 8) return { color: '#9AB654', bg: 'rgba(154,182,84,0.13)' };
  if (score >= 7) return { color: '#D6A35C', bg: 'rgba(214,163,92,0.13)' };
  if (score >= 5) return { color: '#787F85', bg: 'rgba(120,127,133,0.13)' };
  return { color: '#F26669', bg: 'rgba(242,102,105,0.13)' };
}

function tierColors(tier: string) {
  if (tier === 'Tier 1') return { color: '#3DD68C', bg: 'rgba(61,214,140,0.12)', border: 'rgba(61,214,140,0.25)' };
  if (tier === 'Tier 2') return { color: '#46B8D8', bg: 'rgba(70,184,216,0.12)', border: 'rgba(70,184,216,0.25)' };
  return { color: '#787F85', bg: 'rgba(120,127,133,0.10)', border: 'rgba(120,127,133,0.20)' };
}

const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('lean_fit_score', { ascending: false });
  const companies = (data || []) as Company[];

  const total = companies.length;
  const tier1 = companies.filter(c => c.priority_tier === 'Tier 1');
  const tier2 = companies.filter(c => c.priority_tier === 'Tier 2');
  const tier3 = companies.filter(c => c.priority_tier === 'Tier 3');
  const highFit = companies.filter(c => (c.lean_fit_score || 0) >= 8);
  const avgFitScore = total > 0
    ? (companies.reduce((s, c) => s + (c.lean_fit_score || 0), 0) / total).toFixed(2)
    : '0.0';

  // Category breakdown
  const catMap = new Map<string, Company[]>();
  for (const c of companies) {
    const key = c.sub_sector || 'Other';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(c);
  }
  const cats = Array.from(catMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([name, cos], i) => ({
      name,
      count: cos.length,
      avgFit: cos.length > 0 ? (cos.reduce((s, c) => s + (c.lean_fit_score || 0), 0) / cos.length).toFixed(2) : '0.0',
      color: CAT_PALETTE[i % CAT_PALETTE.length],
    }));

  // Coverage gaps — categories with 0 Tier 1
  const covGaps = Array.from(catMap.entries())
    .filter(([, cos]) => !cos.some(c => c.priority_tier === 'Tier 1') && cos.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([name, cos]) => ({ name, count: cos.length }));

  const topShortlist = companies.filter(c => (c.lean_fit_score || 0) >= 7).slice(0, 8);

  const tierPct = (arr: Company[]) => total > 0 ? Math.round((arr.length / total) * 100) : 0;

  // Fully-mapped categories (all have Tier 1)
  const fullyCovered = Array.from(catMap.entries()).filter(([, cos]) => cos.some(c => c.priority_tier === 'Tier 1')).length;

  return (
    <AppShell>
      <div className="page-enter" style={{ padding: '28px 32px 40px', maxWidth: '1280px' }}>

        {/* Header */}
        <p className="eyebrow" style={{ marginBottom: '6px' }}>Today's briefing</p>
        <h1 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 600, color: 'var(--text-hi)' }}>
          Where to source next
        </h1>

        {/* Lead insight card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(61,214,140,0.07), rgba(61,214,140,0.02))',
          border: '1px solid rgba(61,214,140,0.18)',
          borderRadius: '12px', padding: '22px 24px',
          display: 'flex', gap: '24px', alignItems: 'stretch',
          marginBottom: '20px',
        }}>
          <p style={{ flex: 1, margin: 0, fontSize: '14px', lineHeight: '1.65', color: 'var(--text-mid)' }}>
            Your talent universe spans <strong style={{ color: 'var(--text-hi)' }}>{total} companies</strong> across {catMap.size} categories.{' '}
            <strong style={{ color: 'var(--text-hi)' }}>{highFit.length} high-fit pools</strong> (score ≥8) are ready for active sourcing.{' '}
            {covGaps.length > 0
              ? `Coverage gaps remain in ${covGaps.map(g => g.name).join(', ')} — no Tier 1 pools mapped yet.`
              : `All major categories have at least one Tier 1 pool — strong coverage.`}
          </p>
          <div style={{
            borderLeft: '1px solid rgba(61,214,140,0.20)',
            paddingLeft: '24px', display: 'flex', gap: '28px', alignItems: 'center', flexShrink: 0,
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '30px', fontWeight: 500, color: '#3DD68C', lineHeight: 1 }}>{highFit.length}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#787F85' }}>high-fit pools</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '30px', fontWeight: 500, color: 'var(--text-hi)', lineHeight: 1 }}>{tier1.length}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#787F85' }}>Tier 1 pools</p>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { icon: Building2, label: 'Companies tracked', value: total.toString(), sub: `across ${catMap.size} categories`, color: '#3DD68C' },
            { icon: Star, label: 'Tier 1 pools', value: tier1.length.toString(), sub: `${tierPct(tier1)}% of universe`, color: '#3DD68C' },
            { icon: Gauge, label: 'Avg fit score', value: avgFitScore, sub: 'out of 10', color: '#3DD68C' },
            { icon: Target, label: 'High-fit universe', value: highFit.length.toString(), sub: 'fit ≥ 8', color: '#3DD68C' },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '16px 17px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <Icon size={15} style={{ color }} />
                <span style={{ fontSize: '11.5px', color: '#787F85' }}>{label}</span>
              </div>
              <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: 500, color: 'var(--text-hi)', lineHeight: 1 }}>{value}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#5b6066' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Two-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '18px' }}>

          {/* High-fit shortlist */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={15} style={{ color: '#3DD68C' }} />
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-hi)' }}>High-fit shortlist</span>
              </div>
              <Link href="/companies" style={{ fontSize: '12px', color: '#3DD68C', textDecoration: 'none' }}>
                View all companies →
              </Link>
            </div>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 70px 56px',
              padding: '8px 18px', borderBottom: '1px solid var(--border)',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b6066',
            }}>
              <span>Company</span><span>Category</span><span>Region</span><span>Tier</span><span style={{ textAlign: 'right' }}>Fit</span>
            </div>
            {topShortlist.map(c => {
              const tc = tierColors(c.priority_tier || '');
              const fit = c.lean_fit_score || 0;
              const fc = fitColor(fit);
              return (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="hover-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 70px 56px',
                    padding: '10px 18px', alignItems: 'center', textDecoration: 'none',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', color: '#787F85', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.sub_sector || '—'}</span>
                  <span style={{ fontSize: '12px', color: '#787F85' }}>{c.region || '—'}</span>
                  <span>
                    <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {c.priority_tier || '—'}
                    </span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span className="fit-chip" style={{ background: fc.bg, color: fc.color }}>{fit.toFixed(2)}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Priority tiers bar */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)' }}>Priority tiers</p>
              <div style={{ display: 'flex', height: '9px', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px', background: 'var(--border)' }}>
                {[
                  { arr: tier1, color: '#3DD68C' },
                  { arr: tier2, color: '#46B8D8' },
                  { arr: tier3, color: '#5b6066' },
                ].map(({ arr, color }) => (
                  <div key={color} style={{ width: `${tierPct(arr)}%`, background: color }} />
                ))}
              </div>
              {[
                { label: 'Tier 1', arr: tier1, color: '#3DD68C' },
                { label: 'Tier 2', arr: tier2, color: '#46B8D8' },
                { label: 'Tier 3', arr: tier3, color: '#5b6066' },
              ].map(({ label, arr, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '12.5px', color: 'var(--text-mid)' }}>{label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-hi)' }}>{arr.length}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#5b6066', width: '32px', textAlign: 'right' }}>{tierPct(arr)}%</span>
                </div>
              ))}
            </div>

            {/* Top categories */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)' }}>Top categories</p>
                <Link href="/categories" style={{ fontSize: '12px', color: '#3DD68C', textDecoration: 'none' }}>All categories →</Link>
              </div>
              {cats.map(({ name, count, avgFit: af, color }) => (
                <Link
                  key={name}
                  href={`/categories/${encodeURIComponent(name)}`}
                  className="hover-row"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '12.5px', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#3DD68C' }}>{af}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#5b6066' }}>{count}</span>
                </Link>
              ))}
            </div>

            {/* Coverage gaps */}
            {covGaps.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                  <AlertCircle size={15} style={{ color: '#D6A35C' }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)' }}>Coverage gaps</p>
                </div>
                {covGaps.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/categories/${encodeURIComponent(name)}`}
                    className="hover-row"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                  >
                    <span style={{ flex: 1, fontSize: '12.5px', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px',
                      background: 'rgba(214,163,92,0.12)', color: '#D6A35C',
                      borderRadius: '99px', padding: '2px 8px',
                    }}>0 Tier 1</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
