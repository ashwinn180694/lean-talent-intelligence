import { createSupabaseServer } from '@/lib/supabase-server';
import Sidebar from './Sidebar';
import GlobalSearch from './GlobalSearch';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let profile: { display_name: string | null; title: string | null } | null = null;
  if (user?.email) {
    const { data } = await supabase
      .from('user_profiles')
      .select('display_name,title')
      .eq('email', user.email)
      .maybeSingle();
    profile = data;
  }

  return (
    <div className="app-shell">
      <Sidebar
        email={user?.email}
        displayName={profile?.display_name}
        title={profile?.title}
      />
      <main className="app-main">
        <GlobalSearch />
        {children}
      </main>
    </div>
  );
}
