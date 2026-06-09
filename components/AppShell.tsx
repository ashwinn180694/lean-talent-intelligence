import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import FastSidebar from './FastSidebar';
import GlobalSearch from './GlobalSearch';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return (
    <div className="shell">
      <FastSidebar email={session?.user?.email} />
      <main className="main"><GlobalSearch />{children}</main>
    </div>
  );
}
