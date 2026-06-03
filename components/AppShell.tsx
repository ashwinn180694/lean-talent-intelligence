import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Lean Talent Intelligence</div>
        <nav className="nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/companies">Companies</Link>
          <Link href="/candidates">Candidates</Link>
          <Link href="/talent-pools">Talent Pools</Link>
          <Link href="/settings">Settings</Link>
        </nav>
        <div style={{ marginTop: 32, fontSize: 13 }}>
          <div className="muted">Signed in as</div>
          <strong style={{ color: '#fff' }}>{session?.user?.email}</strong>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
