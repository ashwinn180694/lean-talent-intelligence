'use client';

import { useEffect, useState } from 'react';
import TalentPoolClient from './TalentPoolClient';
import PageSkeleton from './PageSkeleton';
import { supabase } from '@/lib/supabase-browser';

const CACHE_KEY = 'lean_cache_talent_pools_v1';

export default function TalentPoolsPageClient() {
  const [pools, setPools] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
      if (cached) setPools(JSON.parse(cached));
    } catch {}

    async function load() {
      setRefreshing(true);
      const { data } = await supabase.from('talent_pools').select('*').order('name');
      if (data) {
        setPools(data);
        try { const serialized = JSON.stringify(data); sessionStorage.setItem(CACHE_KEY, serialized); localStorage.setItem(CACHE_KEY, serialized); } catch {}
      }
      setRefreshing(false);
    }
    load();
  }, []);

  return <>
    <div className="topbar"><div><h1 className="h1">Talent Pools</h1><p className="muted">Create and edit reusable sourcing communities.</p></div>{refreshing && pools ? <span className="sync-pill">Refreshing</span> : null}</div>
    {pools ? <TalentPoolClient initial={pools}/> : <PageSkeleton cards={3}/>} 
  </>;
}
