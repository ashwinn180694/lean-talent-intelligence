import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { MarketGroupCard, MarketHero, marketHref } from '@/components/MarketComponents';
import { MARKET_CATEGORIES } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function CategoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];
  const categories = MARKET_CATEGORIES.map(category => [category, companies.filter(c => (c.sub_sector || 'Global Fintech') === category)] as [string, Company[]]).filter(([, rows]) => rows.length > 0);
  return <AppShell>
    <MarketHero eyebrow="Categories" title="Category markets" subtitle="Start with a talent market, then drill into the company sub-assets inside it." />
    <div className="market-card-grid">
      {categories.map(([category, rows]) => <MarketGroupCard key={category} title={category} description="Category" companies={rows} href={marketHref('/categories', category)} />)}
    </div>
  </AppShell>;
}
