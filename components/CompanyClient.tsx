'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

type CompanyForm = {
  name: string;
  priority_tier: string;
  sector: string;
  sub_sector: string;
  region: string;
  country: string;
  hq: string;
  lean_fit_score: string;
  website_url: string;
  linkedin_company_url: string;
  careers_url: string;
  recommended_functions: string;
  rationale: string;
};

const emptyForm: CompanyForm = {
  name: '',
  priority_tier: 'Tier 2',
  sector: '',
  sub_sector: '',
  region: '',
  country: '',
  hq: '',
  lean_fit_score: '',
  website_url: '',
  linkedin_company_url: '',
  careers_url: '',
  recommended_functions: '',
  rationale: ''
};

function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

export default function CompanyClient({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const [allCompanies, setAllCompanies] = useState<Company[]>(companies);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('All');
  const [region, setRegion] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [savedFilters, setSavedFilters] = useState<{ name: string; q: string; tier: string; region: string }[]>([]);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lean_company_saved_filters');
      if (raw) setSavedFilters(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    setAllCompanies(companies);
    try {
      const serialized = JSON.stringify(companies);
      sessionStorage.setItem('lean_cache_companies_v1', serialized);
      localStorage.setItem('lean_cache_companies_v1', serialized);
    } catch {}
  }, [companies]);

  function persistSavedFilters(next: { name: string; q: string; tier: string; region: string }[]) {
    setSavedFilters(next);
    try { localStorage.setItem('lean_company_saved_filters', JSON.stringify(next)); } catch {}
  }

  function saveCurrentFilter() {
    const name = window.prompt('Name this company filter', `${region !== 'All' ? region : tier !== 'All' ? tier : q || 'Company filter'}`);
    if (!name) return;
    persistSavedFilters([{ name, q, tier, region }, ...savedFilters.filter(f => f.name !== name)].slice(0, 8));
  }

  const quickFilters = [
    { name: 'Open Banking', q: 'Open Banking', tier: 'All', region: 'All' },
    { name: 'Payments', q: 'Payments', tier: 'All', region: 'All' },
    { name: 'GCC', q: '', tier: 'All', region: 'MENA' },
    { name: 'Tier 1', q: '', tier: 'Tier 1', region: 'All' }
  ];

  function applyFilter(f: { q: string; tier: string; region: string }) {
    setQ(f.q);
    setTier(f.tier);
    setRegion(f.region);
  }

  const regions = useMemo(() => {
    const unique = Array.from(new Set(allCompanies.map(c => c.region).filter(Boolean) as string[]));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [allCompanies]);

  const rows = useMemo(() => allCompanies.filter(c => {
    const hay = `${c.name} ${c.sector} ${c.sub_sector} ${c.region} ${c.country}`.toLowerCase();
    return hay.includes(q.toLowerCase())
      && (tier === 'All' || c.priority_tier === tier)
      && (region === 'All' || c.region === region);
  }), [allCompanies, q, tier, region]);

  function updateField(field: keyof CompanyForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function addCompany(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      priority_tier: form.priority_tier || null,
      sector: form.sector.trim() || null,
      sub_sector: form.sub_sector.trim() || null,
      region: form.region.trim() || null,
      country: form.country.trim() || null,
      hq: form.hq.trim() || null,
      lean_fit_score: form.lean_fit_score ? Number(form.lean_fit_score) : null,
      website_url: cleanUrl(form.website_url),
      linkedin_company_url: cleanUrl(form.linkedin_company_url),
      careers_url: cleanUrl(form.careers_url),
      recommended_functions: form.recommended_functions.trim() || null,
      rationale: form.rationale.trim() || null
    };
    const { data, error } = await supabase.from('companies').insert(payload).select('*').single();
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data) setAllCompanies(prev => {
      const next = [data as Company, ...prev].sort((a, b) => a.name.localeCompare(b.name));
      try {
        const serialized = JSON.stringify(next);
        sessionStorage.setItem('lean_cache_companies_v1', serialized);
        localStorage.setItem('lean_cache_companies_v1', serialized);
      } catch {}
      return next;
    });
    setForm(emptyForm);
    setShowAdd(false);
    router.refresh();
  }

  return <>
    <div className="toolbar company-toolbar">
      <div className="company-filter-group">
        <input className="input" style={{ maxWidth: 360 }} placeholder="Search companies..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="select" style={{ maxWidth: 180 }} value={tier} onChange={e => setTier(e.target.value)}>
          <option>All</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option>
        </select>
        <select className="select" style={{ maxWidth: 220 }} value={region} onChange={e => setRegion(e.target.value)}>
          <option value="All">All regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {(q || tier !== 'All' || region !== 'All') && <button className="btn secondary" onClick={() => { setQ(''); setTier('All'); setRegion('All'); }}>Clear filters</button>}
        <button className="btn secondary" onClick={saveCurrentFilter}>Save filter</button>
      </div>
      <button className="btn" onClick={() => setShowAdd(true)}><Plus size={16}/> Add Company</button>
    </div>
    <div className="saved-filter-strip">
      {[...quickFilters, ...savedFilters].map(f => <button key={f.name} className="filter-chip" onClick={() => applyFilter(f)}>{f.name}</button>)}
    </div>
    <div className="muted" style={{ margin: '-6px 0 14px' }}>
      Showing {rows.length} of {allCompanies.length} companies
    </div>
    <div className="grid grid-3">
      {rows.map(c => <div key={c.id} className="card company-card clickable-card">
        <Link href={`/companies/${c.id}`} prefetch className="company-main-link" aria-label={`Open ${c.name} profile`} onClick={() => { try { sessionStorage.setItem(`lean_company_${c.id}`, JSON.stringify(c)); } catch {} }}>
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

    {showAdd && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={addCompany}>
        <div className="modal-header">
          <div>
            <h2>Add Company</h2>
            <p className="muted">Create a new target company in the shared Supabase database.</p>
          </div>
          <button className="icon-btn" type="button" onClick={() => { setShowAdd(false); setError(''); }} aria-label="Close"><X size={20}/></button>
        </div>
        <div className="form-grid">
          <label>Company name<input className="input" value={form.name} onChange={e => updateField('name', e.target.value)} required /></label>
          <label>Priority tier<select className="select" value={form.priority_tier} onChange={e => updateField('priority_tier', e.target.value)}><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select></label>
          <label>Sector<input className="input" value={form.sector} onChange={e => updateField('sector', e.target.value)} /></label>
          <label>Sub-sector<input className="input" value={form.sub_sector} onChange={e => updateField('sub_sector', e.target.value)} /></label>
          <label>Region<input className="input" placeholder="MENA, Europe, North America..." value={form.region} onChange={e => updateField('region', e.target.value)} /></label>
          <label>Country<input className="input" value={form.country} onChange={e => updateField('country', e.target.value)} /></label>
          <label>HQ<input className="input" value={form.hq} onChange={e => updateField('hq', e.target.value)} /></label>
          <label>Lean fit score<input className="input" type="number" min="1" max="10" value={form.lean_fit_score} onChange={e => updateField('lean_fit_score', e.target.value)} /></label>
          <label>Website URL<input className="input" placeholder="https://example.com" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} /></label>
          <label>LinkedIn URL<input className="input" placeholder="https://linkedin.com/company/..." value={form.linkedin_company_url} onChange={e => updateField('linkedin_company_url', e.target.value)} /></label>
          <label>Careers URL<input className="input" value={form.careers_url} onChange={e => updateField('careers_url', e.target.value)} /></label>
          <label>Recommended functions<input className="input" placeholder="Product, Engineering, Partnerships" value={form.recommended_functions} onChange={e => updateField('recommended_functions', e.target.value)} /></label>
        </div>
        <label>Rationale<textarea value={form.rationale} onChange={e => updateField('rationale', e.target.value)} placeholder="Why this company maps well into Lean..." /></label>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={() => { setShowAdd(false); setError(''); }}>Cancel</button>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Company'}</button>
        </div>
      </form>
    </div>}
  </>;
}
