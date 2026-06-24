import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';

const REGION_COLORS: Record<string, string> = {
  'Africa': '#D6A35C',
  'Asia': '#5B5BD6',
  'Europe': '#46B8D8',
  'Latin America': '#F26669',
  'Middle East': '#3DD68C',
  'North America': '#9AB654',
  'Oceania': '#35B979',
  'UAE': '#3DD68C',
  'KSA': '#46B8D8',
  'Global': '#9AB654',
};
const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];

function regionColor(name: string, idx: number) {
  return REGION_COLORS[name] || CAT_PALETTE[idx % CAT_PALETTE.length];
}

export default async function GeographiesPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const regMap = new Map<string, Company[]>();
  for (const c of companies) {
    const key = c.region || 'Unknown';
    if (key === 'Unknown') continue;
    if (!regMap.has(key)) regMap.set(key, []);
    regMap.get(key)!.push(c);
  }

  const regions = Array.from(regMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, cos], i) => {
      const t1 = cos.filter(c => c.priority_tier === 'Tier 1').length;
      const t2 = cos.filter(c => c.priority_tier === 'Tier 2').length;
      const t3 = cos.filter(c => c.priority_tier === 'Tier 3').length;
      const total = cos.length;
      const avgFit = total > 0 ? cos.reduce((s, c) => s + (c.lean_fit_score || 0), 0) / total : 0;
      return { name, cos, t1, t2, t3, total, avgFit, accent: regionColor(name, i) };
    });

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-enter" style={{ padding: '28px 32px 40px' }}>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>Where the talent sits</p>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 600, color: '#EDEEF0' }}>Geographies</h1>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#787F85' }}>
            {regions.length} regions tracked · sorted by company count
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {regions.map(({ name, cos, t1, t2, t3, total, avgFit, accent }) => {
              return (
                <Link
                  key={name}
                  href={`/geographies/${encodeURIComponent(name)}`}
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

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', marginTop: '6px', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#EDEEF0' }}>{name}</p>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: accent }}>{avgFit.toFixed(1)}</span>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 500, color: '#EDEEF0' }}>{total}</span>
                    <span style={{ fontSize: '12px', color: '#5b6066', marginLeft: '5px' }}>companies</span>
                  </div>

                  <div style={{ display: 'flex', height: '5px', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px', background: 'rgba(255,255,255,0.06)' }}>
                    {total > 0 && <>
                      <div style={{ width: `${(t1/total)*100}%`, background: '#3DD68C' }} />
                      <div style={{ width: `${(t2/total)*100}%`, background: '#46B8D8' }} />
                      <div style={{ width: `${(t3/total)*100}%`, background: '#5b6066' }} />
                    </>}
                  </div>

                  <div style={{ display: 'flex', gap: '14px' }}>
                    {[['T1', t1, '#3DD68C'], ['T2', t2, '#46B8D8'], ['T3', t3, '#5b6066']].map(([label, count, color]) => (
                      <span key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: color as string, display: 'inline-block' }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#787F85' }}>{label} {count}</span>
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
