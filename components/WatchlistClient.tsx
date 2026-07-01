'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

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

function exportCSV(rows: Company[]) {
  const cols = ['name','priority_tier','sub_sector','region','country','lean_fit_score','recommended_functions','website_url','linkedin_company_url','careers_url'];
  const headers = ['Company','Tier','Category','Region','Country','Fit','Functions','Website','LinkedIn','Careers'];
  const escape = (v: any) => { const s = String(v ?? ''); return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(','), ...rows.map(r => cols.map(c => escape((r as any)[c])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'watchlist-export.csv';
  a.click();
}

export default function WatchlistClient({ companies: initial, userId }: { companies: Company[]; userId: string }) {
  const [companies, setCompanies] = useState(initial);

  const tier1 = companies.filter(c => c.priority_tier === 'Tier 1').length;
  const avgFit = companies.length > 0
    ? (companies.reduce((s, c) => s + (c.lean_fit_score || 0), 0) / companies.length).toFixed(2)
    : '0.0';

  async function removeFromWatch(companyId: string) {
    await supabase.from('watchlists').delete().eq('user_id', userId).eq('company_id', companyId);
    setCompanies(prev => prev.filter(c => c.id !== companyId));
  }

  if (companies.length === 0) {
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-enter" style={{ padding: '28px 32px 40px' }}>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>Saved for sourcing</p>
          <h1 style={{ margin: '0 0 32px', fontSize: '24px', fontWeight: 600, color: 'var(--text-hi)' }}>Watchlist</h1>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 24px', border: '1px dashed var(--border)',
            borderRadius: '12px', textAlign: 'center', gap: '12px',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(61,214,140,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={24} style={{ color: '#3DD68C' }} />
            </div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-hi)' }}>No companies saved yet</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#787F85', maxWidth: '300px' }}>
              Browse the companies list and click the heart icon to save companies to your watchlist.
            </p>
            <Link href="/companies" className="btn-primary" style={{ marginTop: '8px', textDecoration: 'none' }}>
              Browse companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div className="page-enter" style={{ padding: '28px 32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '6px' }}>Saved for sourcing</p>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 600, color: 'var(--text-hi)' }}>Watchlist</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#787F85' }}>
              {companies.length} companies saved · {tier1} Tier 1 · avg fit {avgFit}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => exportCSV(companies)}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '11px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.7fr 1.5fr 1.2fr 70px 64px 44px',
            padding: '10px 16px', borderBottom: '1px solid var(--border)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b6066',
          }}>
            <span>Company</span><span>Category</span><span>Region</span><span>Tier</span><span>Fit</span><span />
          </div>

          {companies.map(c => {
            const tc = tierColors(c.priority_tier || '');
            const fit = c.lean_fit_score || 0;
            const fc = fitColor(fit);
            return (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="hover-row"
                style={{
                  display: 'grid', gridTemplateColumns: '1.7fr 1.5fr 1.2fr 70px 64px 44px',
                  padding: '11px 16px', alignItems: 'center', textDecoration: 'none',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.name}</span>
                <span style={{ fontSize: '12.5px', color: '#787F85', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{c.sub_sector || '—'}</span>
                <span style={{ fontSize: '12.5px', color: '#787F85', paddingRight: '8px' }}>{c.region || '—'}</span>
                <span>
                  <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                    {c.priority_tier || '—'}
                  </span>
                </span>
                <span>
                  {fit > 0
                    ? <span className="fit-chip" style={{ background: fc.bg, color: fc.color }}>{fit.toFixed(2)}</span>
                    : <span style={{ color: '#5b6066', fontSize: '12px' }}>—</span>}
                </span>
                <span style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); removeFromWatch(c.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#3DD68C', transition: 'color 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F26669')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#3DD68C')}
                    title="Remove from watchlist"
                  >
                    <Heart size={15} fill="#3DD68C" />
                  </button>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
