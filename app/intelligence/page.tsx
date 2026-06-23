import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, groupByValue, tierOneCount } from '@/lib/market';
import type { Company } from '@/lib/types';

function coverageLabel(tier1: number): { label: string; bg: string; color: string } {
  if (tier1 >= 10) return { label: 'Strong',        bg: '#f0fdf4', color: '#15803d' };
  if (tier1 >= 3)  return { label: 'Developing',    bg: '#fffbeb', color: '#b45309' };
  return               { label: 'Needs mapping',  bg: '#fef2f2', color: '#dc2626' };
}

export default async function IntelligencePage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const categories = groupByValue(companies, c => c.sub_sector).filter(([n]) => n !== 'Unknown');
  const geographies = groupByValue(companies, c => c.region).filter(([n]) => n !== 'Unknown').slice(0, 12);

  const rows = [
    ...categories.map(([name, rows]) => ({ type: 'Category', name, rows })),
    ...geographies.map(([name, rows]) => ({ type: 'Geography', name, rows }))
  ].sort((a, b) => tierOneCount(b.rows) - tierOneCount(a.rows) || avgFit(b.rows) - avgFit(a.rows));

  return (
    <AppShell>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c47e3a', marginBottom: '4px' }}>Intelligence</p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Market Coverage</h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: '#9a9080' }}>
            Company density, priority coverage, and fit scores by market and region.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e6e0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede8', background: '#f8f7f4' }}>
                {['Market', 'Type', 'Companies', 'Avg Fit', 'Tier 1', 'Coverage'].map((h, i) => (
                  <th key={h} style={{
                    padding: '11px 18px', textAlign: i >= 2 && i <= 4 ? 'right' : 'left',
                    fontSize: '11px', fontWeight: 600, color: '#9a9080',
                    textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const t1 = tierOneCount(row.rows);
                const avg = avgFit(row.rows);
                const cov = coverageLabel(t1);
                return (
                  <tr
                    key={`${row.type}-${row.name}`}
                    style={{ borderBottom: '1px solid #f8f7f4', transition: 'background 0.1s', cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fdfcfb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '11px 18px', fontWeight: 500, color: '#1a1a2e' }}>{row.name}</td>
                    <td style={{ padding: '11px 18px', color: '#9a9080' }}>{row.type}</td>
                    <td style={{ padding: '11px 18px', textAlign: 'right', color: '#5a5650' }}>{row.rows.length}</td>
                    <td style={{ padding: '11px 18px', textAlign: 'right', color: '#5a5650' }}>{avg || '—'}</td>
                    <td style={{ padding: '11px 18px', textAlign: 'right', color: '#5a5650' }}>{t1}</td>
                    <td style={{ padding: '11px 18px' }}>
                      <span style={{ ...cov, borderRadius: '99px', padding: '2px 9px', fontSize: '11px', fontWeight: 500 }}>
                        {cov.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
