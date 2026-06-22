import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { MarketGroupCard, MarketHero, marketHref } from '@/components/MarketComponents';
import { groupByValue } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function GeographiesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];
  const geographies = groupByValue(companies, c => c.region).filter(([name]) => name !== 'Unknown');
  return <AppShell>
    <MarketHero eyebrow="Geographies" title="Geography markets" subtitle="View target companies by region and sourcing geography." />
    <div className="market-card-grid">
      {geographies.map(([geo, rows]) => <MarketGroupCard key={geo} title={geo} description="Geography" companies={rows} href={marketHref('/geographies', geo)} tone="geography" />)}
    </div>
  </AppShell>;
}
