'use client';

import { useEffect, useState } from 'react';
import CompanyClient from './CompanyClient';
import PageSkeleton from './PageSkeleton';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

const CACHE_KEY = 'lean_cache_companies_v1';

export default function CompaniesPageClient() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
      if (cached) setCompanies(JSON.parse(cached));
    } catch {}

    async function load() {
      setRefreshing(true);
      const { data } = await supabase.from('companies').select('*').order('priority_tier').order('name');
      if (data) {
        setCompanies(data as Company[]);
        try {
          const serialized = JSON.stringify(data);
          sessionStorage.setItem(CACHE_KEY, serialized);
          localStorage.setItem(CACHE_KEY, serialized);
        } catch {}
      }
      setRefreshing(false);
    }
    load();
  }, []);

  return <>
    <div className="topbar"><div><h1 className="h1">Companies</h1><p className="muted">Lean 150 target universe with direct Website and LinkedIn links.</p></div>{refreshing && companies?.length ? <span className="sync-pill">Refreshing</span> : null}</div>
    {companies ? <CompanyClient companies={companies}/> : <PageSkeleton />}
  </>;
}
