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
  { href: '/dashboard',    label: 'Home',         icon: LayoutDashboard },
  { href: '/categories',   label: 'Categories',   icon: Tag },
  { href: '/geographies',  label: 'Geographies',  icon: Globe },
  { href: '/tiers',        label: 'Tiers',        icon: Star },
  { href: '/companies',    label: 'Companies',    icon: Building2 },
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
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">
          L
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">Lean Market</p>
          <p className="text-[10px] text-slate-400 truncate">Talent Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings + Profile */}
      <div className="px-2 pb-3 border-t border-slate-100 pt-2 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/login'))}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {/* User card */}
      {email && (
        <div className="mx-2 mb-3 flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">
            {initials(displayName, email)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {displayName || email.split('@')[0].replace(/[._-]+/g, ' ')}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{title || email}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
