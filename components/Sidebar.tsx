'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Building2, Tag, Globe, Star, Heart, LogOut, Sun, Moon, Menu, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import UserAvatar, { type Profile } from './UserAvatar';
import ProfileModal from './ProfileModal';

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/companies',   label: 'Companies',   icon: Building2 },
  { href: '/categories',  label: 'Categories',  icon: Tag },
  { href: '/geographies', label: 'Geographies', icon: Globe },
  { href: '/tiers',       label: 'Tiers',       icon: Star },
  { href: '/watchlist',   label: 'Watchlist',   icon: Heart, badge: true },
];

export default function Sidebar({
  email,
  displayName,
  title,
}: {
  email?: string | null;
  displayName?: string | null;
  title?: string | null;
}) {
  const pathname = usePathname();
  const [watchCount, setWatchCount] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Read saved theme
    try {
      const saved = localStorage.getItem('lti-theme');
      setIsDark(saved !== 'light');
    } catch {}
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from('watchlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', data.user.id)
        .then(({ count }) => setWatchCount(count ?? 0));
      supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
        .then(({ data: p }) => {
          if (p) setProfile(p as Profile);
          else setProfile({ id: data.user.id, email: data.user.email || '', display_name: displayName, title, avatar_color: '#3DD68C' });
        });
    });
  }, [pathname]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('lti-theme', next ? 'dark' : 'light'); } catch {}
    document.documentElement.setAttribute('data-theme', next ? '' : 'light');
    if (next) document.documentElement.removeAttribute('data-theme');
  }

  const displayLabel = profile?.display_name
    || (email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'User');

  const sidebarContent = (
    <aside
      className={`app-sidebar${mobileOpen ? ' open' : ''}`}
      style={{
        display: 'flex', flexDirection: 'column',
        width: '230px', flexShrink: 0,
        background: 'var(--sb-bg)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
      }}
    >
      {/* Brand header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 14px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '31px', height: '31px', borderRadius: '8px',
            background: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--green-text)', fontSize: '14px', fontWeight: 700, flexShrink: 0,
          }}>L</div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Lean Talent Intelligence
          </p>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px', display: 'flex',
            borderRadius: '5px', transition: 'color 0.12s',
            flexShrink: 0, marginLeft: '6px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '12px 9px', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const showBadge = badge && watchCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className="nav-link"
              data-active={active ? 'true' : undefined}
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px' }}>{label}</span>
              </span>
              {showBadge && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px', fontWeight: 500,
                  background: 'var(--green-16)', color: 'var(--green)',
                  borderRadius: '99px', padding: '1px 7px', lineHeight: '1.6',
                }}>
                  {watchCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '0 9px 6px' }}>
        <button
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/login'))}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
            padding: '8px 11px', borderRadius: '7px',
            fontSize: '13px', color: 'var(--text-muted)', background: 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.12s, color 0.12s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>

      {/* User card */}
      <button
        onClick={() => setShowProfile(true)}
        style={{
          margin: '6px 9px 12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderRadius: '8px', padding: '9px 11px',
          background: 'var(--green-10)',
          border: '1px solid var(--border)',
          flexShrink: 0, cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.12s, border-color 0.12s',
          fontFamily: 'inherit', width: 'calc(100% - 18px)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--green-16)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--green-10)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        }}
      >
        {profile ? (
          <UserAvatar profile={profile} size={29} />
        ) : (
          <div style={{ width: 29, height: 29, borderRadius: '50%', background: 'var(--green-16)', flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayLabel}
          </p>
          <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.title || title || 'Edit profile'}
          </p>
        </div>
      </button>
    </aside>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hi)', display: 'flex', padding: '4px' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div style={{
          width: '26px', height: '26px', borderRadius: '6px',
          background: 'var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--green-text)', fontSize: '12px', fontWeight: 700,
        }}>L</div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)' }}>Lean Talent Intelligence</span>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {sidebarContent}

      {showProfile && profile && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfile(false)}
          onSave={updated => setProfile(updated)}
        />
      )}
    </>
  );
}
