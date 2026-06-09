'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Search, Tags, UserRound, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type SearchResult = {
  id: string;
  type: 'Company' | 'Candidate' | 'Talent Pool';
  title: string;
  subtitle: string;
  href: string;
};

const cacheKeys = {
  companies: 'lean_global_search_companies_v1',
  candidates: 'lean_global_search_candidates_v1',
  pools: 'lean_global_search_pools_v1'
};

function iconFor(type: SearchResult['type']) {
  if (type === 'Company') return <Building2 size={16} />;
  if (type === 'Candidate') return <UserRound size={16} />;
  return <Tags size={16} />;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const cachedCompanies = sessionStorage.getItem(cacheKeys.companies) || localStorage.getItem(cacheKeys.companies);
      const cachedCandidates = sessionStorage.getItem(cacheKeys.candidates) || localStorage.getItem(cacheKeys.candidates);
      const cachedPools = sessionStorage.getItem(cacheKeys.pools) || localStorage.getItem(cacheKeys.pools);
      if (cachedCompanies) setCompanies(JSON.parse(cachedCompanies));
      if (cachedCandidates) setCandidates(JSON.parse(cachedCandidates));
      if (cachedPools) setPools(JSON.parse(cachedPools));
    } catch {}

    async function load() {
      setLoading(true);
      const [{ data: companyRows }, { data: candidateRows }, { data: poolRows }] = await Promise.all([
        supabase.from('companies').select('id,name,sub_sector,region,country,priority_tier,lean_fit_score').order('name').limit(1200),
        supabase.from('candidates_view').select('id,full_name,title,company_name,function_area,status,owner_email,warmth_level,next_follow_up_at,relationship_notes,tags').order('updated_at', { ascending: false }).limit(1200),
        supabase.from('talent_pools').select('id,name,description').order('name').limit(300)
      ]);
      if (companyRows) {
        setCompanies(companyRows);
        try { const serialized = JSON.stringify(companyRows); sessionStorage.setItem(cacheKeys.companies, serialized); localStorage.setItem(cacheKeys.companies, serialized); } catch {}
      }
      if (candidateRows) {
        setCandidates(candidateRows);
        try { const serialized = JSON.stringify(candidateRows); sessionStorage.setItem(cacheKeys.candidates, serialized); localStorage.setItem(cacheKeys.candidates, serialized); } catch {}
      }
      if (poolRows) {
        setPools(poolRows);
        try { const serialized = JSON.stringify(poolRows); sessionStorage.setItem(cacheKeys.pools, serialized); localStorage.setItem(cacheKeys.pools, serialized); } catch {}
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      if ((isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const companyResults = companies
      .filter(c => `${c.name} ${c.sub_sector || ''} ${c.region || ''} ${c.country || ''} ${c.priority_tier || ''}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map(c => ({
        id: `company-${c.id}`,
        type: 'Company' as const,
        title: c.name,
        subtitle: `${c.sub_sector || 'Company'} · ${c.region || c.country || 'Global'}${c.lean_fit_score ? ` · Fit ${c.lean_fit_score}` : ''}`,
        href: `/companies/${c.id}`
      }));

    const candidateResults = candidates
      .filter(c => `${c.full_name} ${c.title || ''} ${c.company_name || ''} ${c.function_area || ''} ${c.status || ''} ${c.owner_email || ''} ${c.warmth_level || ''} ${c.next_follow_up_at || ''} ${c.relationship_notes || ''} ${(c.tags || []).join(' ')}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map(c => ({
        id: `candidate-${c.id}`,
        type: 'Candidate' as const,
        title: c.full_name,
        subtitle: `${c.title || 'Candidate'} · ${c.company_name || 'No company'} · ${c.status || 'Mapped'}${c.next_follow_up_at ? ` · Follow-up ${c.next_follow_up_at}` : ''}`, 
        href: `/candidates/${c.id}`
      }));

    const poolResults = pools
      .filter(p => `${p.name} ${p.description || ''}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map(p => ({
        id: `pool-${p.id}`,
        type: 'Talent Pool' as const,
        title: p.name,
        subtitle: p.description || 'Talent pool',
        href: '/talent-pools'
      }));

    return [...companyResults, ...candidateResults, ...poolResults].slice(0, 18);
  }, [companies, candidates, pools, query]);

  return <>
    <div className="global-search-bar">
      <button className="global-search-trigger" type="button" onClick={() => setOpen(true)}>
        <Search size={16}/>
        <span>Search companies, candidates, pools...</span>
        <kbd>⌘K</kbd>
      </button>
    </div>

    {open && <div className="global-search-overlay" role="dialog" aria-modal="true">
      <div className="global-search-modal">
        <div className="global-search-input-wrap">
          <Search size={18}/>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Plaid, Payments, Interested, Ashwin..." />
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18}/></button>
        </div>
        <div className="global-search-body">
          {query.trim().length < 2 && <div className="global-search-empty">Type at least 2 characters. Try a company, candidate status, function, owner, or pool.</div>}
          {query.trim().length >= 2 && results.length === 0 && <div className="global-search-empty">{loading ? 'Loading search index...' : 'No matching records found.'}</div>}
          {results.length > 0 && <div className="global-result-list">
            {results.map(result => <Link key={result.id} href={result.href} className="global-result-item" onClick={() => setOpen(false)}>
              <div className={`global-result-icon ${result.type.toLowerCase().replace(/\s+/g, '-')}`}>{iconFor(result.type)}</div>
              <div>
                <div className="global-result-title"><span>{result.title}</span><em>{result.type}</em></div>
                <div className="global-result-subtitle">{result.subtitle}</div>
              </div>
            </Link>)}
          </div>}
        </div>
      </div>
    </div>}
  </>;
}
