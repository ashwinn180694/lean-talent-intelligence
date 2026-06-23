import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CompanyCard from '@/components/CompanyCard';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, tierOneCount, unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const name = unslug(params.slug);
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('sub_sector', name)
    .order('priority_tier')
    .order('name');
  const companies = (data || []) as Company[];

  return (
    <AppShell>
      <div className="p-6 space-y-5">
        <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
          <ArrowLeft size={14} /> Categories
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">Category</p>
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {companies.length} companies · Avg fit {avgFit(companies) || '—'} · {tierOneCount(companies)} Tier 1
            </p>
          </div>
        </div>
        {companies.length === 0 ? (
          <div className="card p-12 text-center text-sm text-slate-500">No companies in this category yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map(c => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
