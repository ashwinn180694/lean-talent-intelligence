import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import CompanyDetailClient from '@/components/CompanyDetailClient';

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const [{ data: company }, { data: candidates }, { data: notes }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', params.id).single(),
    supabase.from('candidates_view').select('*').eq('company_id', params.id).order('created_at', { ascending: false }),
    supabase.from('company_notes').select('*').eq('company_id', params.id).order('created_at', { ascending: false })
  ]);
  if (!company) notFound();
  return <AppShell>
    <CompanyDetailClient company={company as any} candidates={(candidates || []) as any} notes={(notes || []) as any} userEmail={session?.user?.email || ''} />
  </AppShell>;
}
