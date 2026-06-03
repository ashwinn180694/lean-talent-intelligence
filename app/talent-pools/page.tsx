import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import TalentPoolClient from '@/components/TalentPoolClient';

export default async function TalentPoolsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('talent_pools').select('*').order('name');
  return (
    <AppShell>
      <div className="topbar">
        <div>
          <h1 className="h1">Talent Pools</h1>
          <p className="muted">Create and edit reusable sourcing communities.</p>
        </div>
      </div>
      <TalentPoolClient initial={(data || []) as any} />
    </AppShell>
  );
}
