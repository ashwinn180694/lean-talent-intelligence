import { createSupabaseServer } from '@/lib/supabase-server';
import Sidebar from './Sidebar';
import GlobalSearch from './GlobalSearch';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer();

  // Use getSession() here — NOT getUser(). getUser() calls the Supabase auth
  // server to validate the JWT, which can trigger a token refresh. In a Server
  // Component we cannot write the refreshed cookies back, so the refresh token
  // gets consumed but the new access token is never saved. The next request then
  // sees an expired token, middleware can't refresh it either, and the user is
  // kicked to /login. getSession() just reads the JWT from cookies with no
  // network call and no refresh — safe for display purposes. Middleware handles
  // all auth validation and token refresh.
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const email = session?.user?.email ?? null;

  let profile: { display_name: string | null; title: string | null } | null = null;
  if (email) {
    const { data } = await supabase
      .from('user_profiles')
      .select('display_name,title')
      .eq('email', email)
      .maybeSingle();
    profile = data;
  }

  return (
    <div className="app-shell">
      <Sidebar
        email={email}
        displayName={profile?.display_name}
        title={profile?.title}
      />
      <main className="app-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <GlobalSearch />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
