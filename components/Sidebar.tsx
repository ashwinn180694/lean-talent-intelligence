'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Building2, Tag, Globe, Star, Heart, LogOut
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      // Load watchlist count
      supabase
        .from('watchlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', data.user.id)
        .then(({ count }) => setWatchCount(count ?? 0));
      // Load profile
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

  const displayLabel = profile?.display_name
    || (email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'User');

  return (
    <>
      <aside style={{
        display: 'flex', flexDirection: 'column',
        width: '230px', flexShrink: 0,
        background: '#131417',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        overflowY: 'auto',
      }}>

        {/* Brand header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '16px 14px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{
            width: '31px', height: '31px', borderRadius: '8px',
            background: '#3DD68C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0c1f16', fontSize: '14px', fontWeight: 700, flexShrink: 0,
          }}>L</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Lean Talent Intelligence
            </p>
          </div>
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
                    background: 'rgba(61,214,140,0.16)', color: '#3DD68C',
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
              fontSize: '13px', color: '#787F85', background: 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.12s, color 0.12s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#787F85';
            }}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>

        {/* User card — click to edit profile */}
        <button
          onClick={() => setShowProfile(true)}
          style={{
            margin: '6px 9px 12px',
            display: 'flex', alignItems: 'center', gap: '10px',
            borderRadius: '8px', padding: '9px 11px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0, cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.12s, border-color 0.12s',
            fontFamily: 'inherit', width: 'calc(100% - 18px)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.13)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
          }}
        >
          {profile ? (
            <UserAvatar profile={profile} size={29} />
          ) : (
            <div style={{ width: 29, height: 29, borderRadius: '50%', background: 'rgba(61,214,140,0.15)', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayLabel}
            </p>
            <p style={{ margin: 0, fontSize: '10.5px', color: '#5b6066', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.title || title || 'Edit profile'}
            </p>
          </div>
        </button>
      </aside>

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
