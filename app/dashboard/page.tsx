import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { MarketGroupCard, MarketHero, marketHref } from '@/components/MarketComponents';
import { groupByValue, MARKET_CATEGORIES, PRIORITY_TIERS } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];
  const categories = MARKET_CATEGORIES.map(category => [category, companies.filter(c => (c.sub_sector || 'Global Fintech') === category)] as [string, Company[]]).filter(([, rows]) => rows.length > 0);
  const geographies = groupByValue(companies, c => c.region).filter(([name]) => name !== 'Unknown').slice(0, 8);
  const tiers = PRIORITY_TIERS.map(tier => [tier, companies.filter(c => c.priority_tier === tier)] as [string, Company[]]).filter(([, rows]) => rows.length > 0);
  const intelligenceCompanies = companies.filter(c => (c.lean_fit_score || 0) >= 8 || c.priority_tier === 'Tier 1');

  return <AppShell>
    <MarketHero eyebrow="Market intelligence" title="Lean Talent Market Map" subtitle="Explore target companies by category, geography, and priority tier. Companies are now sub-assets inside market views." />
    <div className="market-home-grid">
      <section className="market-home-panel">
        <div className="market-panel-heading"><h2>Categories</h2><span>{categories.length} markets</span></div>
        <div className="market-card-grid compact">
          {categories.slice(0, 6).map(([category, rows]) => <MarketGroupCard key={category} title={category} description="Category" companies={rows} href={marketHref('/categories', category)} />)}
        </div>
      </section>
      <section className="market-home-panel">
        <div className="market-panel-heading"><h2>Geographies</h2><span>{geographies.length} regions</span></div>
        <div className="market-card-grid compact">
          {geographies.slice(0, 6).map(([geo, rows]) => <MarketGroupCard key={geo} title={geo} description="Geography" companies={rows} href={marketHref('/geographies', geo)} tone="geography" />)}
        </div>
      </section>
      <section className="market-home-panel">
        <div className="market-panel-heading"><h2>Tiers</h2><span>Priority views</span></div>
        <div className="market-card-grid compact">
          {tiers.map(([tier, rows]) => <MarketGroupCard key={tier} title={tier} description="Priority tier" companies={rows} href={marketHref('/tiers', tier)} tone="tier" />)}
        </div>
      </section>
      <section className="market-home-panel intelligence-panel">
        <div className="market-panel-heading"><h2>Intelligence</h2><span>Insights</span></div>
        <div className="market-card-grid compact">
          <MarketGroupCard title="High-fit universe" description="Fit 8+ / Tier 1" companies={intelligenceCompanies} href="/intelligence" tone="intelligence" />
          <MarketGroupCard title="All companies" description="Full universe" companies={companies} href="/companies" tone="all-companies" />
        </div>
      </section>
    </div>
  </AppShell>;
}
