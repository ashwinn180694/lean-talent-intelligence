'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { Company } from '@/lib/types';

export default function CompanyClient({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('All');
  const rows = useMemo(() => companies.filter(c => {
    const hay = `${c.name} ${c.sector} ${c.sub_sector} ${c.country}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (tier === 'All' || c.priority_tier === tier);
  }), [companies, q, tier]);

  return <>
    <div className="toolbar">
      <input className="input" style={{ maxWidth: 360 }} placeholder="Search companies..." value={q} onChange={e => setQ(e.target.value)} />
      <select className="select" style={{ maxWidth: 180 }} value={tier} onChange={e => setTier(e.target.value)}>
        <option>All</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option>
      </select>
    </div>
    <div className="grid grid-3">
      {rows.map(c => <div key={c.id} className="card company-card clickable-card">
        <Link href={`/companies/${c.id}`} className="company-main-link" aria-label={`Open ${c.name} profile`}>
          <div className="card-title">{c.name}</div>
          <div>
            <span className={`pill ${(c.priority_tier || '').replace(' ', '').toLowerCase()}`}>{c.priority_tier || 'Unassigned'}</span>{' '}
            <span className="pill">Fit {c.lean_fit_score || '-'}</span>
          </div>
          <div className="muted">{c.sub_sector || c.sector || 'Fintech'} · {c.country || c.region || ''}</div>
        </Link>
        <div className="actions" onClick={e => e.stopPropagation()}>
          <a className="btn secondary" href={c.website_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!c.website_url} onClick={e => { if (!c.website_url) e.preventDefault(); }}>Website <ExternalLink size={14}/></a>
          <a className="btn secondary" href={c.linkedin_company_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!c.linkedin_company_url} onClick={e => { if (!c.linkedin_company_url) e.preventDefault(); }}>LinkedIn <ExternalLink size={14}/></a>
        </div>
      </div>)}
    </div>
  </>;
}
