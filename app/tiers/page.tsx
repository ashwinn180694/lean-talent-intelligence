import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, PRIORITY_TIERS, TIER_COLORS, tierOneCount, topCompanies } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function TiersPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const groups = PRIORITY_TIERS.map(tier => ({
    name: tier,
    companies: companies.filter(c => c.priority_tier === tier)
  })).filter(g => g.companies.length > 0);

  return (
    <AppShell>
      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">Market map</p>
          <h1 className="text-2xl font-bold text-slate-900">Priority Tiers</h1>
          <p className="mt-1 text-sm text-slate-500">Companies ranked by strategic priority.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {groups.map(({ name, companies: rows }) => {
            const preview = topCompanies(rows, 5);
            const color = TIER_COLORS[name] ?? 'bg-slate-100 text-slate-600';
            return (
              <Link
                key={name}
                href={`/tiers/${encodeURIComponent(name)}`}
                className="card p-5 hover:border-brand/30 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-800 group-hover:text-brand transition">{name}</h2>
                  <span className={`badge ${color}`}>{rows.length}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mb-3">
                  <span>Avg fit <strong className="text-slate-700">{avgFit(rows) || '—'}</strong></span>
                  {name === 'Tier 1' && <span>Top priority</span>}
                </div>
                <div className="space-y-1">
                  {preview.map(c => (
                    <div key={c.id} className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-0.5 truncate">{c.name}</div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
