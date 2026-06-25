'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Heart, Download, Upload, Bookmark, BookmarkCheck, X, LayoutGrid, LayoutList, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';
import CsvImportModal from './CsvImportModal';

type SortKey = 'name' | 'sub_sector' | 'region' | 'priority_tier' | 'lean_fit_score';
type SortDir = 'asc' | 'desc';

interface SavedSearch {
  name: string;
  q: string;
  tier: string;
  category: string;
  region: string;
}

const TIER_ORDER: Record<string, number> = { 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3 };

const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];
const CAT_LIST = ['Neobank','Payments','Lending','Insurance','WealthTech','Crypto / Digital Assets','RegTech','Open Banking','Remittance','Stablecoin','BaaS','BNPL'];
function catColor(cat?: string | null) {
  const i = CAT_LIST.indexOf(cat || '');
  return CAT_PALETTE[i >= 0 ? i % CAT_PALETTE.length : 0];
}
function countryFlag(country?: string | null): string {
  if (!country) return '';
  const map: Record<string,string> = { 'UAE':'🇦🇪','United Arab Emirates':'🇦🇪','Saudi Arabia':'🇸🇦','KSA':'🇸🇦','USA':'🇺🇸','United States':'🇺🇸','UK':'🇬🇧','United Kingdom':'🇬🇧','Singapore':'🇸🇬','France':'🇫🇷','Germany':'🇩🇪','Switzerland':'🇨🇭','Netherlands':'🇳🇱','Bahrain':'🇧🇭','Egypt':'🇪🇬','Nigeria':'🇳🇬','Kenya':'🇰🇪','Brazil':'🇧🇷','India':'🇮🇳','Hong Kong':'🇭🇰','Israel':'🇮🇱','Turkey':'🇹🇷','Jordan':'🇯🇴','Pakistan':'🇵🇰','Malta':'🇲🇹','Canada':'🇨🇦','Australia':'🇦🇺','Japan':'🇯🇵','Denmark':'🇩🇰','Luxembourg':'🇱🇺','Colombia':'🇨🇴' };
  return map[country] || '';
}

function tierColors(tier: string) {
  if (tier === 'Tier 1') return { color: '#3DD68C', bg: 'rgba(61,214,140,0.12)', border: 'rgba(61,214,140,0.25)' };
  if (tier === 'Tier 2') return { color: '#46B8D8', bg: 'rgba(70,184,216,0.12)', border: 'rgba(70,184,216,0.25)' };
  return { color: '#787F85', bg: 'rgba(120,127,133,0.10)', border: 'rgba(120,127,133,0.20)' };
}

function fitColor(score: number) {
  if (score >= 9) return { color: '#3DD68C', bg: 'rgba(61,214,140,0.13)' };
  if (score >= 8) return { color: '#9AB654', bg: 'rgba(154,182,84,0.13)' };
  if (score >= 7) return { color: '#D6A35C', bg: 'rgba(214,163,92,0.13)' };
  if (score >= 5) return { color: '#787F85', bg: 'rgba(120,127,133,0.13)' };
  return { color: '#F26669', bg: 'rgba(242,102,105,0.13)' };
}

function exportCSV(rows: Company[], filename: string) {
  const cols = ['name','priority_tier','sub_sector','region','country','lean_fit_score','recommended_functions','website_url','linkedin_company_url','headcount_range','funding_stage','total_raised','headquarters'];
  const headers = ['Company','Tier','Category','Region','Country','Fit','Functions','Website','LinkedIn','Headcount','Stage','Total Raised','HQ'];
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map(r => cols.map(c => escape((r as Record<string, unknown>)[c])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}

const SAVED_SEARCHES_KEY = 'lti-saved-searches';

function loadSavedSearches(): SavedSearch[] {
  try { return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]'); } catch { return []; }
}
function persistSavedSearches(list: SavedSearch[]) {
  try { localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(list)); } catch {}
}

export default function CompaniesGrid({
  initialCategory,
  initialRegion,
  initialTier,
}: {
  initialCategory?: string;
  initialRegion?: string;
  initialTier?: string;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchSet, setWatchSet] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [tier, setTier] = useState(initialTier || 'All');
  const [category, setCategory] = useState(initialCategory || '');
  const [region, setRegion] = useState(initialRegion || '');
  const [sortKey, setSortKey] = useState<SortKey>('lean_fit_score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [importOpen, setImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lti-view') as 'table' | 'grid') || 'table';
    }
    return 'table';
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    setSavedSearches(loadSavedSearches());
    try {
      const saved = localStorage.getItem('lti-view') as 'table' | 'grid' | null;
      if (saved === 'table' || saved === 'grid') setViewMode(saved);
    } catch {}
  }, []);

  function toggleView(mode: 'table' | 'grid') {
    setViewMode(mode);
    try { localStorage.setItem('lti-view', mode); } catch {}
  }

  useEffect(() => {
    supabase.from('companies').select('*').then(({ data }) => {
      setCompanies((data || []) as Company[]);
      setLoading(false);
    });
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from('watchlists').select('company_id').eq('user_id', data.user.id).then(({ data: w }) => {
        setWatchSet(new Set((w || []).map((r: { company_id: string }) => r.company_id)));
      });
    });
  }, []);

  const categories = useMemo(() => Array.from(new Set(companies.map(c => c.sub_sector).filter(Boolean) as string[])).sort(), [companies]);
  const regions = useMemo(() => Array.from(new Set(companies.map(c => c.region).filter(Boolean) as string[])).sort(), [companies]);

  const filtered = useMemo(() => {
    let rows = companies.filter(c => {
      const hay = `${c.name} ${c.sub_sector} ${c.region} ${c.priority_tier}`.toLowerCase();
      return (
        (!q || hay.includes(q.toLowerCase())) &&
        (tier === 'All' || !tier || c.priority_tier === tier) &&
        (!category || c.sub_sector === category) &&
        (!region || c.region === region)
      );
    });
    rows = [...rows].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === 'lean_fit_score') { av = a.lean_fit_score || 0; bv = b.lean_fit_score || 0; }
      else if (sortKey === 'priority_tier') { av = TIER_ORDER[a.priority_tier || ''] || 99; bv = TIER_ORDER[b.priority_tier || ''] || 99; }
      else { av = ((a as Record<string, unknown>)[sortKey] as string || '').toLowerCase(); bv = ((b as Record<string, unknown>)[sortKey] as string || '').toLowerCase(); }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [companies, q, tier, category, region, sortKey, sortDir]);

  const hasFilters = q || tier !== 'All' || category || region;

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  async function toggleWatch(e: React.MouseEvent, companyId: string) {
    e.preventDefault(); e.stopPropagation();
    if (!userId) return;
    const isSaved = watchSet.has(companyId);
    const next = new Set(watchSet);
    if (isSaved) {
      next.delete(companyId);
      await supabase.from('watchlists').delete().eq('user_id', userId).eq('company_id', companyId);
    } else {
      next.add(companyId);
      await supabase.from('watchlists').insert({ user_id: userId, company_id: companyId });
    }
    setWatchSet(next);
  }

  function saveCurrentSearch() {
    const name = saveNameInput.trim();
    if (!name) return;
    const newSearch: SavedSearch = { name, q, tier, category, region };
    const updated = [...savedSearches.filter(s => s.name !== name), newSearch];
    setSavedSearches(updated);
    persistSavedSearches(updated);
    setSaveNameInput('');
    setShowSaveInput(false);
  }

  function applySavedSearch(s: SavedSearch) {
    setQ(s.q);
    setTier(s.tier);
    setCategory(s.category);
    setRegion(s.region);
  }

  function deleteSavedSearch(name: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.name !== name);
    setSavedSearches(updated);
    persistSavedSearches(updated);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
  }

  const thStyle = (k: SortKey): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
    userSelect: 'none', color: sortKey === k ? 'var(--text-hi)' : 'var(--text-faint)',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 400,
    transition: 'color 0.12s',
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div className="page-padded" style={{ padding: '28px 32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '4px' }}>Talent universe</p>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-hi)' }}>Companies</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {loading ? 'Loading…' : `${filtered.length} of ${companies.length} companies${hasFilters ? ' · filtered' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '7px', overflow: 'hidden' }}>
              <button
                onClick={() => toggleView('table')}
                title="Table view"
                style={{
                  padding: '6px 10px', background: viewMode === 'table' ? 'var(--green-12)' : 'transparent',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  color: viewMode === 'table' ? 'var(--green)' : 'var(--text-muted)',
                  transition: 'all 0.12s', borderRight: '1px solid var(--border)',
                }}
              >
                <LayoutList size={15} />
              </button>
              <button
                onClick={() => toggleView('grid')}
                title="Grid view"
                style={{
                  padding: '6px 10px', background: viewMode === 'grid' ? 'var(--green-12)' : 'transparent',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  color: viewMode === 'grid' ? 'var(--green)' : 'var(--text-muted)',
                  transition: 'all 0.12s',
                }}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
            <button className="btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload size={14} /> Import CSV
            </button>
            <button className="btn-secondary" onClick={() => exportCSV(filtered, 'companies-export.csv')}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Saved searches */}
        {savedSearches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saved:</span>
            {savedSearches.map(s => (
              <button
                key={s.name}
                onClick={() => applySavedSearch(s)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  borderRadius: '99px', padding: '3px 10px', fontSize: '12px',
                  background: 'var(--green-10)', color: 'var(--green)',
                  border: '1px solid var(--border-accent)', cursor: 'pointer',
                  transition: 'all 0.12s', fontFamily: 'inherit',
                }}
              >
                <BookmarkCheck size={11} />
                {s.name}
                <span
                  onClick={e => deleteSavedSearch(s.name, e)}
                  style={{ marginLeft: '2px', opacity: 0.6, lineHeight: 1 }}
                >
                  <X size={10} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          {/* Tier chips */}
          {['All', 'Tier 1', 'Tier 2', 'Tier 3'].map(t => (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                borderRadius: '99px', padding: '5px 14px', fontSize: '12.5px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
                background: tier === t ? 'var(--green)' : 'transparent',
                color: tier === t ? 'var(--green-text)' : 'var(--text-muted)',
                borderColor: tier === t ? 'var(--green)' : 'var(--border)',
              }}
            >{t}</button>
          ))}

          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

          <select
            className="field-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: 'auto', minWidth: '140px', padding: '5px 28px 5px 10px', fontSize: '12.5px' }}
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="field-select"
            value={region}
            onChange={e => setRegion(e.target.value)}
            style={{ width: 'auto', minWidth: '130px', padding: '5px 28px 5px 10px', fontSize: '12.5px' }}
          >
            <option value="">All regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {hasFilters && (
            <>
              <button
                onClick={() => { setQ(''); setTier('All'); setCategory(''); setRegion(''); }}
                style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', transition: 'color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Clear ×
              </button>
              {/* Save search */}
              {showSaveInput ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    autoFocus
                    value={saveNameInput}
                    onChange={e => setSaveNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveCurrentSearch(); if (e.key === 'Escape') setShowSaveInput(false); }}
                    placeholder="Search name…"
                    style={{
                      fontSize: '12px', padding: '4px 9px', borderRadius: '6px',
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text-hi)', outline: 'none', fontFamily: 'inherit', width: '130px',
                    }}
                  />
                  <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={saveCurrentSearch}>Save</button>
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setShowSaveInput(false)}>×</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveInput(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', transition: 'color 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Bookmark size={12} /> Save search
                </button>
              )}
            </>
          )}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            className="field-input"
            placeholder="Search companies…"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ maxWidth: '320px', fontSize: '13px', padding: '8px 12px' }}
          />
        </div>

        {/* Table view */}
        {viewMode === 'table' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '11px', overflow: 'hidden' }}>
            {/* Sticky header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.7fr 1.5fr 1.2fr 2fr 70px 64px 40px',
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0,
              background: 'var(--surface)', zIndex: 1,
            }}>
              {([
                ['name', 'Company'],
                ['sub_sector', 'Category'],
                ['region', 'Region'],
                [null, 'Functions'],
                ['priority_tier', 'Tier'],
                ['lean_fit_score', 'Fit'],
              ] as [SortKey | null, string][]).map(([k, label]) => (
                <div
                  key={label}
                  style={k ? thStyle(k) : { ...thStyle('name'), cursor: 'default' }}
                  onClick={() => k && handleSort(k)}
                >
                  {label} {k && <SortIcon k={k} />}
                </div>
              ))}
              <div />
            </div>

            {/* Rows */}
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px' }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px' }}>
                No companies match these filters.
              </div>
            ) : filtered.map(c => {
              const tc = tierColors(c.priority_tier || '');
              const fit = c.lean_fit_score || 0;
              const fc = fitColor(fit);
              const isSaved = watchSet.has(c.id);
              return (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="hover-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '1.7fr 1.5fr 1.2fr 2fr 70px 64px 40px',
                    padding: '11px 16px', alignItems: 'center', textDecoration: 'none',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.name}</span>
                  <span className="table-col-category" style={{ fontSize: '12.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.sub_sector || '—'}</span>
                  <span className="table-col-region" style={{ fontSize: '12.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.region || '—'}</span>
                  <span className="table-col-functions" style={{ fontSize: '12px', color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                    {c.recommended_functions || '—'}
                  </span>
                  <span>
                    <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {c.priority_tier || '—'}
                    </span>
                  </span>
                  <span>
                    {fit > 0 ? (
                      <span className="fit-chip" style={{ background: fc.bg, color: fc.color }}>{fit.toFixed(1)}</span>
                    ) : <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>—</span>}
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={e => toggleWatch(e, c.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: isSaved ? 'var(--green)' : 'var(--border)', transition: 'color 0.12s' }}
                      onMouseEnter={e => { if (!isSaved) (e.currentTarget as HTMLElement).style.color = 'var(--green)'; }}
                      onMouseLeave={e => { if (!isSaved) (e.currentTarget as HTMLElement).style.color = 'var(--border)'; }}
                    >
                      <Heart size={15} fill={isSaved ? 'var(--green)' : 'none'} />
                    </button>
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && (
          <>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px' }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px' }}>
                No companies match these filters.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}
                className="companies-grid-view"
              >
                {filtered.map(c => {
                  const tc = tierColors(c.priority_tier || '');
                  const fit = c.lean_fit_score || 0;
                  const fc = fitColor(fit);
                  const isSaved = watchSet.has(c.id);
                  const accent = catColor(c.sub_sector);
                  const flag = countryFlag(c.hq_country || c.country || c.hq);
                  const country = c.hq_country || c.country || c.hq || '';
                  const fns = (c.recommended_functions || '').split(/[,;]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 2);
                  return (
                    <Link
                      key={c.id}
                      href={`/companies/${c.id}`}
                      style={{ textDecoration: 'none', position: 'relative', display: 'block' }}
                    >
                      <div
                        className="company-grid-card"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '16px',
                          transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                          cursor: 'pointer',
                          height: '100%',
                          boxSizing: 'border-box',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        }}
                      >
                        {/* Top row: avatar + watchlist */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '9px', flexShrink: 0,
                            background: `${accent}22`, border: `1px solid ${accent}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: accent, fontSize: '18px', fontWeight: 700,
                          }}>
                            {(c.name || '?')[0].toUpperCase()}
                          </div>
                          <button
                            onClick={e => toggleWatch(e, c.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: isSaved ? 'var(--green)' : 'var(--border)', transition: 'color 0.12s' }}
                            onMouseEnter={e => { if (!isSaved) (e.currentTarget as HTMLElement).style.color = 'var(--green)'; }}
                            onMouseLeave={e => { if (!isSaved) (e.currentTarget as HTMLElement).style.color = 'var(--border)'; }}
                          >
                            <Heart size={15} fill={isSaved ? 'var(--green)' : 'none'} />
                          </button>
                        </div>

                        {/* Name */}
                        <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-hi)', lineHeight: 1.3 }}>{c.name}</p>

                        {/* Tier + Fit */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          {c.priority_tier && (
                            <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontSize: '11px' }}>
                              {c.priority_tier}
                            </span>
                          )}
                          {fit > 0 && (
                            <span className="fit-chip" style={{ background: fc.bg, color: fc.color, fontSize: '11px' }}>{fit.toFixed(1)}</span>
                          )}
                        </div>

                        {/* Country */}
                        {country && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            {flag && <span>{flag}</span>}
                            <span>{country}</span>
                          </div>
                        )}

                        {/* Headcount */}
                        {c.headcount_range && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            <Users size={12} style={{ color: 'var(--text-faint)' }} />
                            <span>{c.headcount_range}</span>
                          </div>
                        )}

                        {/* Funding stage */}
                        {c.funding_stage && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <TrendingUp size={12} style={{ color: 'var(--text-faint)' }} />
                            <span>{c.funding_stage}</span>
                          </div>
                        )}

                        {/* Recommended functions */}
                        {fns.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                            {fns.map((fn: string) => (
                              <span key={fn} style={{
                                fontSize: '10.5px', padding: '2px 8px',
                                background: 'var(--green-10)', color: 'var(--green)',
                                borderRadius: '99px', border: '1px solid var(--border-accent)',
                              }}>{fn}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      {importOpen && (
        <CsvImportModal
          onClose={() => setImportOpen(false)}
          onDone={() => {
            supabase.from('companies').select('*').then(({ data }) => {
              setCompanies((data || []) as Company[]);
            });
          }}
        />
      )}
    </div>
  );
}
