import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import CandidateClient from '@/components/CandidateClient';

export default async function CandidatesPage() {
  const supabase = createServerComponentClient({ cookies });
  const [{ data: candidates }, { data: companies }] = await Promise.all([
    supabase.from('candidates_view').select('*').order('created_at', { ascending: false }),
    supabase.from('companies').select('id,name').order('name')
  ]);
  return <AppShell><div className="topbar"><div><h1 className="h1">Candidates</h1><p className="muted">Mapped talent connected to target companies.</p></div></div><CandidateClient initial={candidates || []} companies={companies || []}/></AppShell>;
}
