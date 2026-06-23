import Link from 'next/link';
import { Tag, Globe, Star, Building2, Lightbulb, ArrowRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, groupByValue, MARKET_CATEGORIES, PRIORITY_TIERS, tierOneCount, topCompanies } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const categories = MARKET_CATEGORIES.map(cat => ({
    name: cat,
    companies: companies.filter(c => (c.sub_sector || 'Global Fintech') === cat)
  })).filter(g => g.companies.length > 0);

  const geographies = groupByValue(companies, c => c.region)
    .filter(([name]) => name !== 'Unknown')
    .slice(0, 8);

  const tiers = PRIORITY_TIERS.map(tier => ({
    name: tier,
    companies: companies.filter(c => c.priority_tier === tier)
  })).filter(g => g.companies.length > 0);

  const highFit = companies.filter(c => (c.lean_fit_score || 0) >= 8 || c.priority_tier === 'Tier 1');

  return (
    <AppShell>
      <div className="p-6 space-y-8">
        {/* Hero */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">Market intelligence</p>
          <h1 className="text-2xl font-bold text-slate-900">Lean Talent Market Map</h1>
          <p className="mt-1 text-sm text-slate-500">
            {companies.length} companies across {categories.length} categories and {geographies.length} regions.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total companies', value: companies.length, icon: Building2 },
            { label: 'Tier 1', value: tierOneCount(companies), icon: Star },
            { label: 'Avg fit score', value: avgFit(companies) || '—', icon: Lightbulb },
            { label: 'High-fit universe', value: highFit.length, icon: Lightbulb }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card px-5 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <Icon size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <Section title="Categories" icon={<Tag size={16} />} count={categories.length} href="/categories">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.slice(0, 6).map(({ name, companies: rows }) => (
              <MarketCard
                key={name}
                title={name}
                count={rows.length}
                avgFit={avgFit(rows)}
                tier1={tierOneCount(rows)}
                preview={topCompanies(rows, 3).map(c => c.name)}
                href={`/categories/${encodeURIComponent(name)}`}
              />
            ))}
          </div>
        </Section>

        {/* Geographies */}
        <Section title="Geographies" icon={<Globe size={16} />} count={geographies.length} href="/geographies">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {geographies.slice(0, 6).map(([geo, rows]) => (
              <MarketCard
                key={geo}
                title={geo}
                count={rows.length}
                avgFit={avgFit(rows)}
                tier1={tierOneCount(rows)}
                preview={topCompanies(rows, 3).map(c => c.name)}
                href={`/geographies/${encodeURIComponent(geo)}`}
              />
            ))}
          </div>
        </Section>

        {/* Tiers */}
        <Section title="Priority Tiers" icon={<Star size={16} />} count={tiers.length} href="/tiers">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tiers.map(({ name, companies: rows }) => (
              <MarketCard
                key={name}
                title={name}
                count={rows.length}
                avgFit={avgFit(rows)}
                tier1={tierOneCount(rows)}
                preview={topCompanies(rows, 3).map(c => c.name)}
                href={`/tiers/${encodeURIComponent(name)}`}
              />
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  icon,
  count,
  href,
  children
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-brand">{icon}</span>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <span className="badge bg-slate-100 text-slate-500">{count}</span>
        </div>
        <Link href={href} className="flex items-center gap-1 text-xs text-brand hover:underline">
          View all <ArrowRight size={12} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function MarketCard({
  title,
  count,
  avgFit: avg,
  tier1,
  preview,
  href
}: {
  title: string;
  count: number;
  avgFit: number;
  tier1: number;
  preview: string[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card p-4 hover:border-brand/30 hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-brand transition">
          {title}
        </h3>
        <span className="badge bg-brand/10 text-brand">{count}</span>
      </div>
      <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
        <span>Avg fit <strong className="text-slate-700">{avg || '—'}</strong></span>
        <span>Tier 1 <strong className="text-slate-700">{tier1}</strong></span>
      </div>
      <div className="space-y-1">
        {preview.map(name => (
          <div key={name} className="truncate text-xs text-slate-500 bg-slate-50 rounded px-2 py-0.5">
            {name}
          </div>
        ))}
      </div>
    </Link>
  );
}
