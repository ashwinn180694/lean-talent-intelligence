'use client';
import { useEffect, useState } from 'react';
import FastSidebar from './FastSidebar';
import GlobalSearch from './GlobalSearch';
import { supabase } from '@/lib/supabase-browser';

export default function AppShellStatic({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const userEmail = data.user?.email || null;
      setEmail(userEmail);
      if (userEmail) {
        const { data: p } = await supabase.from('user_profiles').select('display_name,title').eq('email', userEmail).maybeSingle();
        setProfile(p);
      }
    }
    load();
  }, []);

  return <div className="shell v11-shell"><FastSidebar email={email} displayName={profile?.display_name} title={profile?.title}/><main className="main v11-main"><GlobalSearch />{children}</main></div>;
}
