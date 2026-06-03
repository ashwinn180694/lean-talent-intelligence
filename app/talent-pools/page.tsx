import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';

export default async function TalentPoolsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('talent_pools').select('*').order('name');
  return <AppShell><div className="topbar"><div><h1 className="h1">Talent Pools</h1><p className="muted">Reusable communities for sourcing workflows.</p></div></div><div className="grid grid-3">{(data || []).map((p:any) => <div className="card" key={p.id}><div className="card-title">{p.name}</div><p className="muted">{p.description}</p></div>)}</div></AppShell>;
}
