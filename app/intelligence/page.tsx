import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { MarketHero } from '@/components/MarketComponents';
import { avgFit, groupByValue, tierOneCount } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function IntelligencePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];
  const categories = groupByValue(companies, c => c.sub_sector).filter(([name]) => name !== 'Unknown');
  const geographies = groupByValue(companies, c => c.region).filter(([name]) => name !== 'Unknown').slice(0, 10);
  const rows = [...categories.map(([name, rows]) => ({ type: 'Category', name, rows })), ...geographies.map(([name, rows]) => ({ type: 'Geography', name, rows }))]
    .sort((a, b) => tierOneCount(b.rows) - tierOneCount(a.rows) || avgFit(b.rows) - avgFit(a.rows));
  return <AppShell>
    <MarketHero eyebrow="Intelligence" title="Market coverage and rankings" subtitle="A market-level view of company density, priority coverage, and Lean fit." />
    <div className="market-intelligence-table card">
      <table className="table">
        <thead><tr><th>Market</th><th>Type</th><th>Companies</th><th>Avg Fit</th><th>Tier 1</th><th>Coverage Signal</th></tr></thead>
        <tbody>
          {rows.map(row => <tr key={`${row.type}-${row.name}`}>
            <td><strong>{row.name}</strong></td>
            <td>{row.type}</td>
            <td>{row.rows.length}</td>
            <td>{avgFit(row.rows) || '-'}</td>
            <td>{tierOneCount(row.rows)}</td>
            <td><span className="status-pill">{tierOneCount(row.rows) >= 10 ? 'Strong' : tierOneCount(row.rows) >= 3 ? 'Developing' : 'Needs mapping'}</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </AppShell>;
}
