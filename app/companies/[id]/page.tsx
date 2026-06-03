import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import CompanyDetailClient from '@/components/CompanyDetailClient';

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').eq('id', params.id).single();
  if (!data) notFound();
  return <AppShell>
    <CompanyDetailClient company={data as any} />
  </AppShell>;
}
