'use client';

import { useEffect, useState } from 'react';
import CandidateClient from './CandidateClient';
import PageSkeleton from './PageSkeleton';
import { supabase } from '@/lib/supabase-browser';

const CANDIDATES_CACHE = 'lean_cache_candidates_v1';
const COMPANIES_LOOKUP_CACHE = 'lean_cache_companies_lookup_v1';

export default function CandidatesPageClient() {
  const [candidates, setCandidates] = useState<any[] | null>(null);
  const [companies, setCompanies] = useState<any[] | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const cachedCandidates = sessionStorage.getItem(CANDIDATES_CACHE) || localStorage.getItem(CANDIDATES_CACHE);
      const cachedCompanies = sessionStorage.getItem(COMPANIES_LOOKUP_CACHE) || localStorage.getItem(COMPANIES_LOOKUP_CACHE);
      if (cachedCandidates) setCandidates(JSON.parse(cachedCandidates));
      if (cachedCompanies) setCompanies(JSON.parse(cachedCompanies));
    } catch {}

    async function load() {
      setRefreshing(true);
      const [{ data: sessionData }, { data: candidateRows }, { data: companyRows }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('candidates_view').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('id,name').order('name')
      ]);
      setUserEmail(sessionData?.session?.user?.email || '');
      if (candidateRows) {
        setCandidates(candidateRows);
        try { const serialized = JSON.stringify(candidateRows); sessionStorage.setItem(CANDIDATES_CACHE, serialized); localStorage.setItem(CANDIDATES_CACHE, serialized); } catch {}
      }
      if (companyRows) {
        setCompanies(companyRows);
        try { const serialized = JSON.stringify(companyRows); sessionStorage.setItem(COMPANIES_LOOKUP_CACHE, serialized); localStorage.setItem(COMPANIES_LOOKUP_CACHE, serialized); } catch {}
      }
      setRefreshing(false);
    }
    load();
  }, []);

  return <>
    <div className="topbar"><div><h1 className="h1">Candidates</h1><p className="muted">Mapped talent connected to target companies.</p></div>{refreshing && candidates ? <span className="sync-pill">Refreshing</span> : null}</div>
    {candidates && companies ? <CandidateClient initial={candidates} companies={companies} userEmail={userEmail}/> : <PageSkeleton />}
  </>;
}
