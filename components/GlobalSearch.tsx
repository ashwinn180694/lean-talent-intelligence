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
      <div style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '10px 24px' }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', maxWidth: '380px',
            border: '1px solid var(--border)', borderRadius: '8px',
            background: 'var(--hover-row-bg)', padding: '7px 12px',
            fontSize: '13px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Search size={13} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search companies…</span>
          <kbd style={{
            display: 'inline-flex', alignItems: 'center', borderRadius: '5px',
            border: '1px solid var(--border)', background: 'var(--card-bg)',
            padding: '1px 6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'inherit'
          }}>⌘K</kbd>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(4px)', paddingTop: '72px', paddingLeft: '16px', paddingRight: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '520px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--hover-row-bg)', padding: '12px 16px' }}>
              <Search size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search Plaid, Payments, UAE…"
                style={{ flex: 1, background: 'transparent', fontSize: '14px', color: 'var(--text-primary)', border: 'none', outline: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px' }}>
              {query.trim().length < 2 && (
                <p style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-faint)' }}>
                  Type at least 2 characters…
                </p>
              )}
              {query.trim().length >= 2 && hits.length === 0 && (
                <p style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-faint)' }}>
                  {loading ? 'Loading…' : 'No results found.'}
                </p>
              )}
              {hits.map(hit => (
                <Link
                  key={hit.id}
                  href={hit.href}
                  onClick={() => setOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', padding: '9px 10px', textDecoration: 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ display: 'flex', width: '28px', height: '28px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '7px', background: 'var(--hover-row-bg)', color: 'var(--text-muted)' }}>
                    {kindIcon(hit.kind)}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hit.title}</p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hit.sub}</p>
                  </div>
                  <span style={{ flexShrink: 0, borderRadius: '99px', background: 'var(--hover-row-bg)', padding: '2px 8px', fontSize: '10px', color: 'var(--text-muted)' }}>
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
