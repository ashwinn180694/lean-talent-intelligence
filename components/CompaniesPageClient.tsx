'use client';

import { useEffect, useState } from 'react';
import CompanyClient from './CompanyClient';
import PageSkeleton from './PageSkeleton';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

const CACHE_KEY = 'lean_cache_companies_v2_awesomefintech';

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
      const { data } = await supabase.from('companies').select('*').order('sub_sector').order('lean_fit_score', { ascending: false }).order('name');
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
    <div className="topbar"><div><h1 className="h1">FinTech Companies</h1><p className="muted">AwesomeFinTech-style market map focused on fintech categories, geography and Lean fit.</p></div>{refreshing && companies?.length ? <span className="sync-pill">Refreshing</span> : null}</div>
    {companies ? <CompanyClient companies={companies}/> : <PageSkeleton />}
  </>;
}
