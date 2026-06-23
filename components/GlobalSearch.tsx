'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, Tags, UserRound, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Hit = {
  id: string;
  kind: 'Company' | 'Candidate' | 'Pool';
  title: string;
  sub: string;
  href: string;
};

const SEARCH_CACHE = 'lean_search_index_v1';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<{ companies: any[]; candidates: any[]; pools: any[] }>({
    companies: [],
    candidates: [],
    pools: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search index once (lazy — only when search is first opened)
  useEffect(() => {
    if (!open) return;
    try {
      const cached = sessionStorage.getItem(SEARCH_CACHE) ?? localStorage.getItem(SEARCH_CACHE);
      if (cached) { setIndex(JSON.parse(cached)); return; }
    } catch {}

    async function load() {
      setLoading(true);
      const [{ data: companies }, { data: candidates }, { data: pools }] = await Promise.all([
        supabase
          .from('companies')
          .select('id,name,sub_sector,region,country,lean_fit_score,priority_tier')
          .order('name')
          .limit(1200),
        supabase
          .from('candidates_view')
          .select('id,full_name,title,company_name,function_area,status,owner_email,tags')
          .order('updated_at', { ascending: false })
          .limit(600),
        supabase.from('talent_pools').select('id,name,description').order('name').limit(200)
      ]);
      const next = { companies: companies || [], candidates: candidates || [], pools: pools || [] };
      setIndex(next);
      try {
        const s = JSON.stringify(next);
        sessionStorage.setItem(SEARCH_CACHE, s);
        localStorage.setItem(SEARCH_CACHE, s);
      } catch {}
      setLoading(false);
    }
    load();
  }, [open]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mac = navigator.platform.toLowerCase().includes('mac');
      if ((mac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else setQuery('');
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const companyHits = index.companies
      .filter(c =>
        `${c.name} ${c.sub_sector} ${c.region} ${c.country} ${c.priority_tier}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 8)
      .map(c => ({
        id: `c-${c.id}`,
        kind: 'Company' as const,
        title: c.name,
        sub: `${c.sub_sector || 'Company'} · ${c.region || 'Global'}${c.lean_fit_score ? ` · Fit ${c.lean_fit_score}` : ''}`,
        href: `/companies/${c.id}`
      }));

    const candidateHits = index.candidates
      .filter(c =>
        `${c.full_name} ${c.title} ${c.company_name} ${c.function_area} ${c.status} ${(c.tags || []).join(' ')}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 6)
      .map(c => ({
        id: `p-${c.id}`,
        kind: 'Candidate' as const,
        title: c.full_name,
        sub: `${c.title || 'Candidate'} · ${c.company_name || 'No company'} · ${c.status || 'Mapped'}`,
        href: `/candidates/${c.id}`
      }));

    const poolHits = index.pools
      .filter(p => `${p.name} ${p.description}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({
        id: `pool-${p.id}`,
        kind: 'Pool' as const,
        title: p.name,
        sub: p.description || 'Talent pool',
        href: '/talent-pools'
      }));

    return [...companyHits, ...candidateHits, ...poolHits].slice(0, 18);
  }, [query, index]);

  const kindIcon = (kind: Hit['kind']) => {
    if (kind === 'Company') return <Building2 size={15} />;
    if (kind === 'Candidate') return <UserRound size={15} />;
    return <Tags size={15} />;
  };

  return (
    <>
      {/* Trigger bar */}
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-sm px-6 py-2.5">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 hover:border-brand/40 transition"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search companies, candidates…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm pt-16 px-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="card w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search Plaid, Payments, function area…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim().length < 2 && (
                <p className="px-3 py-6 text-center text-sm text-slate-400">
                  Type at least 2 characters…
                </p>
              )}
              {query.trim().length >= 2 && hits.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-slate-400">
                  {loading ? 'Loading…' : 'No results found.'}
                </p>
              )}
              {hits.map(hit => (
                <Link
                  key={hit.id}
                  href={hit.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    {kindIcon(hit.kind)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{hit.title}</p>
                    <p className="truncate text-xs text-slate-400">{hit.sub}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                    {hit.kind}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
