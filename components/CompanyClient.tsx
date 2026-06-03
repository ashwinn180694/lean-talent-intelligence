'use client';
import { useMemo, useState } from 'react';
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
      <select className="select" style={{ maxWidth: 180 }} value={tier} onChange={e => setTier(e.target.value)}><option>All</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select>
    </div>
    <div className="grid grid-3">
      {rows.map(c => <div key={c.id} className="card company-card">
        <div className="card-title">{c.name}</div>
        <div><span className={`pill ${(c.priority_tier || '').replace(' ', '').toLowerCase()}`}>{c.priority_tier || 'Unassigned'}</span> <span className="pill">Fit {c.lean_fit_score || '-'}</span></div>
        <div className="muted">{c.sub_sector || c.sector || 'Fintech'} · {c.country || c.region || ''}</div>
        <div className="actions">
          <a className="btn secondary" href={c.website_url || '#'} target="_blank" aria-disabled={!c.website_url}>Website <ExternalLink size={14}/></a>
          <a className="btn secondary" href={c.linkedin_company_url || '#'} target="_blank" aria-disabled={!c.linkedin_company_url}>LinkedIn <ExternalLink size={14}/></a>
        </div>
      </div>)}
    </div>
  </>;
}
