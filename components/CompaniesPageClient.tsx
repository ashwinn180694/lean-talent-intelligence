'use client';

import { useEffect, useState } from 'react';
import CompanyClient from './CompanyClient';
import PageSkeleton from './PageSkeleton';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

const COMPANY_CACHE_KEYS = ['lean_cache_companies_current', 'lean_cache_companies_v1', 'lean_cache_companies_v2_awesomefintech'];

function writeCompanyCaches(companies: Company[]) {
  try {
    const serialized = JSON.stringify(companies);
    COMPANY_CACHE_KEYS.forEach(key => {
      sessionStorage.setItem(key, serialized);
      localStorage.setItem(key, serialized);
    });
  } catch {}
}

export default function CompaniesPageClient() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(COMPANY_CACHE_KEYS[0]) || localStorage.getItem(COMPANY_CACHE_KEYS[0]);
      if (cached) setCompanies(JSON.parse(cached));
    } catch {}

    async function load() {
      setRefreshing(true);
      const { data } = await supabase.from('companies').select('*').order('priority_tier').order('name');
      if (data) {
        setCompanies(data as Company[]);
        writeCompanyCaches(data as Company[]);
      }
      setRefreshing(false);
    }
    load();
  }, []);

  return <>
    <div className="topbar"><div><h1 className="h1">Companies</h1><p className="muted">Focused fintech company universe with direct Website and LinkedIn links.</p></div>{refreshing && companies?.length ? <span className="sync-pill">Refreshing</span> : null}</div>
    {companies ? <CompanyClient companies={companies} onCompaniesChange={setCompanies}/> : <PageSkeleton />}
  </>;
}
