import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';

const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];

export default async function CategoriesPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const catMap = new Map<string, Company[]>();
  for (const c of companies) {
    const key = c.sub_sector || 'Other';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(c);
  }

  const cats = Array.from(catMap.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([name, cos], i) => {
      const t1 = cos.filter(c => c.priority_tier === 'Tier 1').length;
      const t2 = cos.filter(c => c.priority_tier === 'Tier 2').length;
      const t3 = cos.filter(c => c.priority_tier === 'Tier 3').length;
      const total = cos.length;
      const avgFit = total > 0 ? cos.reduce((s, c) => s + (c.lean_fit_score || 0), 0) / total : 0;
      const topTier = t1 > 0 ? 'T1' : t2 > 0 ? 'T2' : 'T3';
      const topTierColor = t1 > 0 ? '#3DD68C' : t2 > 0 ? '#46B8D8' : '#787F85';
      return { name, cos, t1, t2, t3, total, avgFit, topTier, topTierColor, accent: CAT_PALETTE[i % CAT_PALETTE.length] };
    });

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-enter" style={{ padding: '28px 32px 40px' }}>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>Market structure</p>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 600, color: '#EDEEF0' }}>Categories</h1>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#787F85' }}>
            {cats.length} talent categories · tinted by sector, bar shows tier mix
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {cats.map(({ name, cos, t1, t2, t3, total, avgFit, topTier, topTierColor, accent }) => {
              const top3 = cos.slice(0, 3).map(c => c.name);
              return (
                <Link
                  key={name}
                  href={`/categories/${encodeURIComponent(name)}`}
                  style={{
                    display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden',
                    background: '#212329', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '11px', padding: '17px 18px 16px',
                    transition: 'transform 0.16s cubic-bezier(0.2,0.8,0.2,1), border-color 0.16s, box-shadow 0.16s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 26px rgba(0,0,0,0.38)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', pointerEvents: 'none', background: `radial-gradient(circle at top right, ${accent}24, transparent 68%)` }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', marginTop: '6px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#EDEEF0' }}>{name}</p>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', background: `${topTierColor}20`, color: topTierColor, borderRadius: '99px', padding: '2px 8px' }}>{topTier}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 500, color: '#EDEEF0' }}>{total}</span>
                      <span style={{ fontSize: '12px', color: '#5b6066', marginLeft: '5px' }}>companies</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 500, color: accent }}>{avgFit.toFixed(1)}</span>
                  </div>

                  <div style={{ display: 'flex', height: '5px', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px', background: 'rgba(255,255,255,0.06)' }}>
                    {total > 0 && <>
                      <div style={{ width: `${(t1/total)*100}%`, background: '#3DD68C' }} />
                      <div style={{ width: `${(t2/total)*100}%`, background: '#46B8D8' }} />
                      <div style={{ width: `${(t3/total)*100}%`, background: '#5b6066' }} />
                    </>}
                  </div>

                  <p style={{ margin: 0, fontSize: '11.5px', color: '#5b6066', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{top3.join(' · ')}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
