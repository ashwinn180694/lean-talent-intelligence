import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import CompanyClient from '@/components/CompanyClient';

export default async function CompaniesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('companies').select('*').order('priority_tier').order('name');
  return <AppShell><div className="topbar"><div><h1 className="h1">Companies</h1><p className="muted">Lean 150 target universe with direct Website and LinkedIn links.</p></div></div><CompanyClient companies={(data || []) as any}/></AppShell>;
}
