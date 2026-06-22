import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import { CompanyGrid, MarketWorkspaceHeader } from '@/components/MarketComponents';
import { unslug } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function GeographyWorkspace({ params }: { params: { slug: string } }) {
  const geography = unslug(params.slug);
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').or(`region.eq.${geography},sub_sector.eq.${geography}`).order('lean_fit_score', { ascending: false });
  const companies = (data || []) as Company[];
  return <AppShell>
    <MarketWorkspaceHeader label={geography} companies={companies} />
    <CompanyGrid companies={companies} />
  </AppShell>;
}
