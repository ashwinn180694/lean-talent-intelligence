'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreloadRoutes } from './RoutePreloader';

const nav = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/companies', label: 'Companies', icon: '◧' },
  { href: '/candidates', label: 'Candidates', icon: '◎' },
  { href: '/talent-pools', label: 'Talent Pools', icon: '◇' },
  { href: '/ashby', label: 'Ashby', icon: '▣' },
  { href: '/settings', label: 'Settings', icon: '⚙' }
];

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || 'LT').trim();
  const parts = base.replace(/@.*/, '').split(/[.\s_-]+/).filter(Boolean);
  return (parts[0]?.[0] || 'L').toUpperCase() + (parts[1]?.[0] || 'T').toUpperCase();
}

export default function FastSidebar({ email, displayName, title }: { email?: string | null; displayName?: string | null; title?: string | null }) {
  const pathname = usePathname();
  const preload = usePreloadRoutes();
  return (
    <aside className="sidebar v11-sidebar">
      <div className="brand v11-brand">
        <div className="brand-mark">L</div>
        <div>
          <div>Lean Talent</div>
          <span>Intelligence OS</span>
        </div>
      </div>
      <nav className="nav v11-nav">
        {nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} prefetch className={active ? 'active' : ''} onMouseEnter={() => preload(item.href)}><span>{item.icon}</span>{item.label}</Link>;
        })}
      </nav>
      <div className="sidebar-footer">
        {email ? <Link href="/settings" className="profile-mini-card">
          <div className="avatar-circle">{initials(displayName, email)}</div>
          <div className="profile-mini-copy">
            <strong>{displayName || email.split('@')[0].replace(/[._-]+/g, ' ')}</strong>
            <span>{title || email}</span>
          </div>
        </Link> : <div className="profile-mini-card ghost-profile"><div className="avatar-circle">LT</div><div className="profile-mini-copy"><strong>Lean Talent</strong><span>Signed out</span></div></div>}
      </div>
    </aside>
  );
}
