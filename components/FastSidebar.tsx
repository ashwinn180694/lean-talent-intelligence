'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreloadRoutes } from './RoutePreloader';

const nav = [
  { href: '/dashboard', label: 'Home' },
  { href: '/companies', label: 'Companies' },
  { href: '/candidates', label: 'Candidates' },
  { href: '/talent-pools', label: 'Talent Pools' },
  { href: '/settings', label: 'Settings' }
];

export default function FastSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const preload = usePreloadRoutes();
  return (
    <aside className="sidebar">
      <div className="brand">Lean Talent Intelligence</div>
      <nav className="nav">
        {nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} prefetch className={active ? 'active' : ''} onMouseEnter={() => preload(item.href)}>{item.label}</Link>;
        })}
      </nav>
      {email && <div style={{ marginTop: 32, fontSize: 13 }}>
        <div className="muted">Signed in as</div>
        <strong style={{ color: '#fff' }}>{email}</strong>
      </div>}
    </aside>
  );
}
