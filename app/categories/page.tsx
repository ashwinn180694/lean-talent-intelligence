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
      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">Market map</p>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">{groups.length} active categories across {companies.length} companies.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(({ name, companies: rows }) => {
            const preview = topCompanies(rows, 4);
            return (
              <Link
                key={name}
                href={`/categories/${encodeURIComponent(name)}`}
                className="card p-5 hover:border-brand/30 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-800 group-hover:text-brand transition">{name}</h2>
                  <span className="badge bg-brand/10 text-brand">{rows.length}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mb-3">
                  <span>Avg fit <strong className="text-slate-700">{avgFit(rows) || '—'}</strong></span>
                  <span>Tier 1 <strong className="text-slate-700">{tierOneCount(rows)}</strong></span>
                </div>
                <div className="space-y-1">
                  {preview.map(c => (
                    <div key={c.id} className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-0.5 truncate">{c.name}</div>
                  ))}
                  {rows.length > 4 && (
                    <div className="flex items-center gap-1 text-xs text-brand">+{rows.length - 4} more <ArrowRight size={10} /></div>
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
