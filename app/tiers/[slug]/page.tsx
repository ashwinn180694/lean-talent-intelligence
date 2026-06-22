import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { CompanyGrid, MarketWorkspaceHeader } from '@/components/MarketComponents';
import { unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function TierWorkspace({ params }: { params: { slug: string } }) {
  const tier = unslug(params.slug);
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').eq('priority_tier', tier).order('lean_fit_score', { ascending: false });
  const companies = (data || []) as Company[];
  return <AppShell>
    <MarketWorkspaceHeader label={tier} companies={companies} />
    <CompanyGrid companies={companies} />
  </AppShell>;
}
