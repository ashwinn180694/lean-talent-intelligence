'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Tag, Globe, Star,
  Building2, Lightbulb, Settings, LogOut, Palette
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import { useTheme, type Theme } from '@/components/ThemeProvider';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/companies',    label: 'Companies',    icon: Building2 },
  { href: '/categories',   label: 'Categories',   icon: Tag },
  { href: '/geographies',  label: 'Geographies',  icon: Globe },
  { href: '/tiers',        label: 'Tiers',        icon: Star },
  { href: '/intelligence', label: 'Intelligence', icon: Lightbulb }
];

const THEME_DOTS: Record<Theme, string> = {
  warm:  '#c47e3a',
  dark:  '#7c74ff',
  slate: '#3b82f6',
};

const THEME_LABELS: Record<Theme, string> = {
  warm:  'Warm',
  dark:  'Dark',
  slate: 'Slate',
};

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || 'LT').replace(/@.*/, '').trim();
  const parts = base.split(/[.\s_-]+/).filter(Boolean);
  return ((parts[0]?.[0] || 'L') + (parts[1]?.[0] || 'T')).toUpperCase();
}

function SidebarLink({
  href, label, icon: Icon, active
}: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      href={href}
      className="sidebar-nav-link"
      data-active={active ? 'true' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '8px 12px',
        borderRadius: '7px',
        fontSize: '13px',
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--sb-active)' : 'var(--sb-text)',
        background: active ? 'var(--sb-active-bg)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      {label}
    </Link>
  );
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
  const { theme, setTheme } = useTheme();

  const themes: Theme[] = ['warm', 'dark', 'slate'];

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      width: '220px', flexShrink: 0,
      background: 'var(--sb-bg)',
      overflowY: 'auto',
      transition: 'background 0.25s',
    }}>

      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '18px 16px 14px',
        borderBottom: '1px solid var(--sb-border)'
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '7px',
          background: 'var(--sb-brand-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '14px', fontWeight: 600, flexShrink: 0,
          transition: 'background 0.25s',
        }}>L</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sb-text-hover)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Lean Market
          </p>
          <p style={{ fontSize: '10.5px', color: 'var(--sb-logo-sub)', margin: 0, whiteSpace: 'nowrap' }}>
            Talent Intelligence
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 8px', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <SidebarLink key={href} href={href} label={label} icon={Icon} active={active} />;
        })}
      </nav>

      {/* Theme switcher */}
      <div style={{ padding: '10px 12px 6px', borderTop: '1px solid var(--sb-border)' }}>
        <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--sb-logo-sub)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Theme
        </p>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {themes.map(t => (
            <button
              key={t}
              title={THEME_LABELS[t]}
              onClick={() => setTheme(t)}
              style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: THEME_DOTS[t],
                border: theme === t ? '2px solid var(--sb-text-hover)' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'border-color 0.15s, transform 0.1s',
                transform: theme === t ? 'scale(1.15)' : 'scale(1)',
                outline: 'none',
              }}
            />
          ))}
          <span style={{ fontSize: '11px', color: 'var(--sb-logo-sub)', marginLeft: '4px' }}>
            {THEME_LABELS[theme]}
          </span>
        </div>
      </div>

      {/* Settings + Sign out */}
      <div style={{ padding: '6px 8px' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '8px 12px', borderRadius: '7px',
            fontSize: '13px', color: 'var(--sb-text)', textDecoration: 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sb-text-hover)';
            (e.currentTarget as HTMLElement).style.background = 'var(--sb-hover-bg)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sb-text)';
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
            fontSize: '13px', color: 'var(--sb-text)', background: 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.15s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sb-text-hover)';
            (e.currentTarget as HTMLElement).style.background = 'var(--sb-hover-bg)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sb-text)';
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
          margin: '4px 8px 12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderRadius: '8px', padding: '10px 12px',
          background: 'var(--sb-user-bg)',
          border: '1px solid var(--sb-border)',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(128,128,200,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--sb-active)', fontSize: '11px', fontWeight: 600,
          }}>
            {initials(displayName, email)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sb-text-hover)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName || email.split('@')[0].replace(/[._-]+/g, ' ')}
            </p>
            <p style={{ fontSize: '10.5px', color: 'var(--sb-logo-sub)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title || email}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
