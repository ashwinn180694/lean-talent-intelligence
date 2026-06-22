import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { MarketGroupCard, MarketHero, marketHref } from '@/components/MarketComponents';
import { PRIORITY_TIERS } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function TiersPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];
  const tiers = PRIORITY_TIERS.map(tier => [tier, companies.filter(c => c.priority_tier === tier)] as [string, Company[]]).filter(([, rows]) => rows.length > 0);
  return <AppShell>
    <MarketHero eyebrow="Priority tiers" title="Priority market views" subtitle="Review the highest-impact company targets first." />
    <div className="market-card-grid">
      {tiers.map(([tier, rows]) => <MarketGroupCard key={tier} title={tier} description="Priority tier" companies={rows} href={marketHref('/tiers', tier)} tone="tier" />)}
    </div>
  </AppShell>;
}
