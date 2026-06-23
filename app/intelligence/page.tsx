import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, groupByValue, tierOneCount } from '@/lib/market';
import type { Company } from '@/lib/types';

function coverageLabel(tier1: number): { label: string; cls: string } {
  if (tier1 >= 10) return { label: 'Strong', cls: 'bg-emerald-100 text-emerald-800' };
  if (tier1 >= 3) return { label: 'Developing', cls: 'bg-amber-100 text-amber-800' };
  return { label: 'Needs mapping', cls: 'bg-red-100 text-red-800' };
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
      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">Intelligence</p>
          <h1 className="text-2xl font-bold text-slate-900">Market Coverage</h1>
          <p className="mt-1 text-sm text-slate-500">
            Company density, priority coverage, and fit scores by market and region.
          </p>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Market</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-right">Companies</th>
                <th className="px-5 py-3 text-right">Avg Fit</th>
                <th className="px-5 py-3 text-right">Tier 1</th>
                <th className="px-5 py-3 text-left">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => {
                const t1 = tierOneCount(row.rows);
                const avg = avgFit(row.rows);
                const { label, cls } = coverageLabel(t1);
                return (
                  <tr key={`${row.type}-${row.name}`} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-medium text-slate-800">{row.name}</td>
                    <td className="px-5 py-3 text-slate-500">{row.type}</td>
                    <td className="px-5 py-3 text-right text-slate-700">{row.rows.length}</td>
                    <td className="px-5 py-3 text-right text-slate-700">{avg || '—'}</td>
                    <td className="px-5 py-3 text-right text-slate-700">{t1}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${cls}`}>{label}</span>
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
