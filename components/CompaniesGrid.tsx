'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Heart, Download, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';
import CsvImportModal from './CsvImportModal';

type SortKey = 'name' | 'sub_sector' | 'region' | 'priority_tier' | 'lean_fit_score';
type SortDir = 'asc' | 'desc';

const TIER_ORDER: Record<string, number> = { 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3 };

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
  const cols = ['name','priority_tier','sub_sector','region','country','lean_fit_score','recommended_functions','website_url','linkedin_company_url'];
  const headers = ['Company','Tier','Category','Region','Country','Fit','Functions','Website','LinkedIn'];
  const escape = (v: any) => {
    const s = String(v ?? '');
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map(r => cols.map(c => escape((r as any)[c])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
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

  useEffect(() => {
    supabase.from('companies').select('*').then(({ data }) => {
      setCompanies((data || []) as Company[]);
      setLoading(false);
    });
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from('watchlists').select('company_id').eq('user_id', data.user.id).then(({ data: w }) => {
        setWatchSet(new Set((w || []).map((r: any) => r.company_id)));
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
      let av: any, bv: any;
      if (sortKey === 'lean_fit_score') { av = a.lean_fit_score || 0; bv = b.lean_fit_score || 0; }
      else if (sortKey === 'priority_tier') { av = TIER_ORDER[a.priority_tier || ''] || 99; bv = TIER_ORDER[b.priority_tier || ''] || 99; }
      else { av = ((a as any)[sortKey] || '').toLowerCase(); bv = ((b as any)[sortKey] || '').toLowerCase(); }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    // Name as tiebreaker
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
    const saved = watchSet.has(companyId);
    const next = new Set(watchSet);
    if (saved) {
      next.delete(companyId);
      await supabase.from('watchlists').delete().eq('user_id', userId).eq('company_id', companyId);
    } else {
      next.add(companyId);
      await supabase.from('watchlists').insert({ user_id: userId, company_id: companyId });
    }
    setWatchSet(next);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
  }

  const thStyle = (k: SortKey): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
    userSelect: 'none', color: sortKey === k ? '#FFFFFF' : '#5b6066',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 400,
    transition: 'color 0.12s',
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '28px 32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '4px' }}>Talent universe</p>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>Companies</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#787F85' }}>
              {loading ? 'Loading…' : `${filtered.length} of ${companies.length} companies${hasFilters ? ' · filtered' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload size={14} /> Import CSV
            </button>
            <button className="btn-secondary" onClick={() => exportCSV(filtered, 'companies-export.csv')}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

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
                background: tier === t ? '#3DD68C' : 'transparent',
                color: tier === t ? '#0c1f16' : '#787F85',
                borderColor: tier === t ? '#3DD68C' : 'rgba(255,255,255,0.12)',
              }}
            >{t}</button>
          ))}

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.10)', margin: '0 4px' }} />

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
            <button
              onClick={() => { setQ(''); setTier('All'); setCategory(''); setRegion(''); }}
              style={{ fontSize: '12px', color: '#787F85', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', transition: 'color 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#787F85')}
            >
              Clear ×
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#212329', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '11px', overflow: 'hidden' }}>
          {/* Sticky header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.7fr 1.5fr 1.2fr 2fr 70px 64px 40px',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky', top: 0,
            background: '#212329', zIndex: 1,
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
            <div style={{ padding: '48px', textAlign: 'center', color: '#5b6066', fontSize: '13px' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5b6066', fontSize: '13px' }}>
              No companies match these filters.
            </div>
          ) : filtered.map(c => {
            const tc = tierColors(c.priority_tier || '');
            const fit = c.lean_fit_score || 0;
            const fc = fitColor(fit);
            const saved = watchSet.has(c.id);
            return (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="hover-row"
                style={{
                  display: 'grid', gridTemplateColumns: '1.7fr 1.5fr 1.2fr 2fr 70px 64px 40px',
                  padding: '11px 16px', alignItems: 'center', textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.name}</span>
                <span style={{ fontSize: '12.5px', color: '#787F85', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.sub_sector || '—'}</span>
                <span style={{ fontSize: '12.5px', color: '#787F85', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.region || '—'}</span>
                <span style={{ fontSize: '12px', color: '#5b6066', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
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
                  ) : <span style={{ color: '#5b6066', fontSize: '12px' }}>—</span>}
                </span>
                <span style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={e => toggleWatch(e, c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: saved ? '#3DD68C' : '#3a3d43', transition: 'color 0.12s' }}
                    onMouseEnter={e => { if (!saved) (e.currentTarget as HTMLElement).style.color = '#3DD68C'; }}
                    onMouseLeave={e => { if (!saved) (e.currentTarget as HTMLElement).style.color = '#3a3d43'; }}
                  >
                    <Heart size={15} fill={saved ? '#3DD68C' : 'none'} />
                  </button>
                </span>
              </Link>
            );
          })}
        </div>
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
