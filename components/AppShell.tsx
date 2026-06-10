import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import FastSidebar from './FastSidebar';
import GlobalSearch from './GlobalSearch';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  let profile: any = null;
  if (session?.user?.email) {
    const { data } = await supabase.from('user_profiles').select('display_name,title').eq('email', session.user.email).maybeSingle();
    profile = data;
  }
  return (
    <div className="shell v11-shell">
      <FastSidebar email={session?.user?.email} displayName={profile?.display_name} title={profile?.title} />
      <main className="main v11-main"><GlobalSearch />{children}</main>
    </div>
  );
}
