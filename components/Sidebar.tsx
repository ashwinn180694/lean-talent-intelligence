'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tag,
  Globe,
  Star,
  Building2,
  Lightbulb,
  Settings,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/companies',    label: 'Companies',    icon: Building2 },
  { href: '/categories',   label: 'Categories',   icon: Tag },
  { href: '/geographies',  label: 'Geographies',  icon: Globe },
  { href: '/tiers',        label: 'Tiers',        icon: Star },
  { href: '/intelligence', label: 'Intelligence', icon: Lightbulb }
];

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || 'LT').replace(/@.*/, '').trim();
  const parts = base.split(/[.\s_-]+/).filter(Boolean);
  return ((parts[0]?.[0] || 'L') + (parts[1]?.[0] || 'T')).toUpperCase();
}

export default function Sidebar({
  email,
  displayName,
  title
}: {
  email?: string | null;
  displayName?: string | null;
  title?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', width: '220px', flexShrink: 0, background: '#1a1a2e', overflowY: 'auto' }}>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '7px',
          background: '#c47e3a', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 600, flexShrink: 0
        }}>
          L
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#e8e6f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Lean Market
          </p>
          <p style={{ fontSize: '10.5px', color: '#5a5878', margin: 0, whiteSpace: 'nowrap' }}>
            Talent Intelligence
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 8px', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '8px 12px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? '#c47e3a' : '#8884a0',
                background: active ? 'rgba(196, 126, 58, 0.13)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.12s'
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = '#c8c4dc';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = '#8884a0';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '8px 12px', borderRadius: '7px',
            fontSize: '13px', color: '#8884a0', textDecoration: 'none',
            transition: 'all 0.12s'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#c8c4dc';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#8884a0';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Settings size={15} />
          Settings
        </Link>
        <button
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/login'))}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
            padding: '8px 12px', borderRadius: '7px',
            fontSize: '13px', color: '#8884a0', background: 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.12s', fontFamily: 'inherit'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#c8c4dc';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#8884a0';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      {/* User card */}
      {email && (
        <div style={{
          margin: '8px 8px 12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderRadius: '8px', padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(196, 126, 58, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c47e3a', fontSize: '11px', fontWeight: 600
          }}>
            {initials(displayName, email)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#c8c4dc', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName || email.split('@')[0].replace(/[._-]+/g, ' ')}
            </p>
            <p style={{ fontSize: '10.5px', color: '#5a5878', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title || email}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
