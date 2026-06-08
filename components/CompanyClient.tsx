'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Plus, X, Globe2, Layers3 } from 'lucide-react';
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
  source_url: string;
};

const emptyForm: CompanyForm = {
  name: '',
  priority_tier: 'Tier 2',
  sector: 'FinTech',
  sub_sector: '',
  region: 'Global',
  country: '',
  hq: '',
  lean_fit_score: '',
  website_url: '',
  linkedin_company_url: '',
  careers_url: '',
  recommended_functions: 'Engineering, Product, Commercial, Partnerships, Risk/Compliance',
  rationale: '',
  source_url: ''
};

function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

function sourceLabel(c: Company) {
  return c.awesomefintech_rank || c.source || 'AwesomeFinTech public directory';
}

export default function CompanyClient({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const [allCompanies, setAllCompanies] = useState<Company[]>(companies);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('All');
  const [region, setRegion] = useState('All');
  const [category, setCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [savedFilters, setSavedFilters] = useState<{ name: string; q: string; tier: string; region: string; category: string }[]>([]);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lean_company_saved_filters_v2');
      if (raw) setSavedFilters(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    setAllCompanies(companies);
    try {
      const serialized = JSON.stringify(companies);
      sessionStorage.setItem('lean_cache_companies_v2_awesomefintech', serialized);
      localStorage.setItem('lean_cache_companies_v2_awesomefintech', serialized);
    } catch {}
  }, [companies]);

  function persistSavedFilters(next: { name: string; q: string; tier: string; region: string; category: string }[]) {
    setSavedFilters(next);
    try { localStorage.setItem('lean_company_saved_filters_v2', JSON.stringify(next)); } catch {}
  }

  function saveCurrentFilter() {
    const name = window.prompt('Name this fintech market view', `${category !== 'All' ? category : region !== 'All' ? region : q || 'Fintech view'}`);
    if (!name) return;
    persistSavedFilters([{ name, q, tier, region, category }, ...savedFilters.filter(f => f.name !== name)].slice(0, 8));
  }

  const quickFilters = [
    { name: 'Payments', q: '', tier: 'All', region: 'All', category: 'Payments' },
    { name: 'Open Banking', q: '', tier: 'All', region: 'All', category: 'Open Banking' },
    { name: 'Banking', q: '', tier: 'All', region: 'All', category: 'Banking' },
    { name: 'RegTech', q: '', tier: 'All', region: 'All', category: 'RegTech' },
    { name: 'Neobanks', q: '', tier: 'All', region: 'All', category: 'Neobanks' },
    { name: 'Tier 1', q: '', tier: 'Tier 1', region: 'All', category: 'All' }
  ];

  function applyFilter(f: { q: string; tier: string; region: string; category: string }) {
    setQ(f.q);
    setTier(f.tier);
    setRegion(f.region);
    setCategory(f.category);
  }

  const regions = useMemo(() => Array.from(new Set(allCompanies.map(c => c.region).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)), [allCompanies]);
  const categories = useMemo(() => Array.from(new Set(allCompanies.map(c => c.sub_sector || c.sector).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)), [allCompanies]);
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    allCompanies.forEach(c => map.set(c.sub_sector || c.sector || 'Unassigned', (map.get(c.sub_sector || c.sector || 'Unassigned') || 0) + 1));
    return Array.from(map.entries()).sort((a,b) => b[1] - a[1]).slice(0, 8);
  }, [allCompanies]);

  const rows = useMemo(() => allCompanies.filter(c => {
    const hay = `${c.name} ${c.sector} ${c.sub_sector} ${c.region} ${c.country} ${c.rationale} ${c.awesomefintech_categories}`.toLowerCase();
    return hay.includes(q.toLowerCase())
      && (tier === 'All' || c.priority_tier === tier)
      && (region === 'All' || c.region === region)
      && (category === 'All' || c.sub_sector === category || (c.awesomefintech_categories || '').includes(category));
  }), [allCompanies, q, tier, region, category]);

  function updateField(field: keyof CompanyForm, value: string) { setForm(prev => ({ ...prev, [field]: value })); }

  async function addCompany(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Company name is required.'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      priority_tier: form.priority_tier || null,
      sector: form.sector.trim() || 'FinTech',
      sub_sector: form.sub_sector.trim() || null,
      region: form.region.trim() || 'Global',
      country: form.country.trim() || null,
      hq: form.hq.trim() || null,
      lean_fit_score: form.lean_fit_score ? Number(form.lean_fit_score) : null,
      website_url: cleanUrl(form.website_url),
      linkedin_company_url: cleanUrl(form.linkedin_company_url),
      careers_url: cleanUrl(form.careers_url),
      recommended_functions: form.recommended_functions.trim() || null,
      rationale: form.rationale.trim() || null,
      source: 'Manual fintech company',
      source_url: cleanUrl(form.source_url)
    };
    const { data, error } = await supabase.from('companies').insert(payload).select('*').single();
    setSaving(false);
    if (error) { setError(error.message); return; }
    if (data) setAllCompanies(prev => {
      const next = [data as Company, ...prev].sort((a, b) => a.name.localeCompare(b.name));
      try {
        const serialized = JSON.stringify(next);
        sessionStorage.setItem('lean_cache_companies_v2_awesomefintech', serialized);
        localStorage.setItem('lean_cache_companies_v2_awesomefintech', serialized);
      } catch {}
      return next;
    });
    setForm(emptyForm); setShowAdd(false); router.refresh();
  }

  const totalTier1 = allCompanies.filter(c => c.priority_tier === 'Tier 1').length;

  return <>
    <div className="market-map-hero card">
      <div>
        <div className="eyebrow"><Globe2 size={15}/> FinTech market map</div>
        <h2>Unified fintech company universe</h2>
        <p className="muted">Companies are organized by fintech category, geography, source and Lean fit. The dataset merges your original FinTech Weekly universe with AwesomeFinTech public category signals and preserves existing candidate mappings.</p>
      </div>
      <div className="market-stats">
        <div><strong>{allCompanies.length}</strong><span>Companies</span></div>
        <div><strong>{categories.length}</strong><span>Categories</span></div>
        <div><strong>{totalTier1}</strong><span>Tier 1</span></div>
      </div>
    </div>

    <div className="category-strip card">
      {categoryCounts.map(([name, count]) => <button key={name} className={`category-tile ${category === name ? 'active' : ''}`} onClick={() => setCategory(name)}>
        <Layers3 size={16}/><strong>{name}</strong><span>{count} companies</span>
      </button>)}
    </div>

    <div className="toolbar company-toolbar">
      <div className="company-filter-group">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search fintech companies..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="select" style={{ maxWidth: 210 }} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="All">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select" style={{ maxWidth: 180 }} value={tier} onChange={e => setTier(e.target.value)}>
          <option>All</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option>
        </select>
        <select className="select" style={{ maxWidth: 180 }} value={region} onChange={e => setRegion(e.target.value)}>
          <option value="All">All geography</option>{regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {(q || tier !== 'All' || region !== 'All' || category !== 'All') && <button className="btn secondary" onClick={() => { setQ(''); setTier('All'); setRegion('All'); setCategory('All'); }}>Clear</button>}
        <button className="btn secondary" onClick={saveCurrentFilter}>Save view</button>
      </div>
      <button className="btn" onClick={() => setShowAdd(true)}><Plus size={16}/> Add Company</button>
    </div>

    <div className="saved-filter-strip">{[...quickFilters, ...savedFilters].map(f => <button key={f.name} className="filter-chip" onClick={() => applyFilter(f)}>{f.name}</button>)}</div>
    <div className="muted" style={{ margin: '-6px 0 14px' }}>Showing {rows.length} of {allCompanies.length} fintech companies</div>

    <div className="grid grid-3">
      {rows.map(c => <div key={c.id} className="card company-card clickable-card fintech-company-card">
        <Link href={`/companies/${c.id}`} prefetch className="company-main-link" aria-label={`Open ${c.name} profile`} onClick={() => { try { sessionStorage.setItem(`lean_company_${c.id}`, JSON.stringify(c)); } catch {} }}>
          <div className="card-title">{c.name}</div>
          <div><span className={`pill ${(c.priority_tier || '').replace(' ', '').toLowerCase()}`}>{c.priority_tier || 'Unassigned'}</span>{' '}<span className="pill">Fit {c.lean_fit_score || '-'}</span></div>
          <div className="muted">{c.sub_sector || c.sector || 'FinTech'} · {c.region || 'Global'}</div>
          <div className="source-mini">{sourceLabel(c)}</div>
        </Link>
        <div className="actions" onClick={e => e.stopPropagation()}>
          <a className="btn secondary" href={c.website_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!c.website_url} onClick={e => { if (!c.website_url) e.preventDefault(); }}>Website <ExternalLink size={14}/></a>
          <a className="btn secondary" href={c.linkedin_company_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!c.linkedin_company_url} onClick={e => { if (!c.linkedin_company_url) e.preventDefault(); }}>LinkedIn <ExternalLink size={14}/></a>
        </div>
      </div>)}
    </div>

    {showAdd && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={addCompany}>
        <div className="modal-header"><div><h2>Add Company</h2><p className="muted">Add a company to the fintech market map. Website/LinkedIn can be edited later.</p></div><button className="icon-btn" type="button" onClick={() => { setShowAdd(false); setError(''); }} aria-label="Close"><X size={20}/></button></div>
        <div className="form-grid">
          <label>Company name<input className="input" value={form.name} onChange={e => updateField('name', e.target.value)} required /></label>
          <label>Category<input className="input" placeholder="Payments, Open Banking, RegTech..." value={form.sub_sector} onChange={e => updateField('sub_sector', e.target.value)} /></label>
          <label>Priority tier<select className="select" value={form.priority_tier} onChange={e => updateField('priority_tier', e.target.value)}><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select></label>
          <label>Lean fit score<input className="input" type="number" min="1" max="10" value={form.lean_fit_score} onChange={e => updateField('lean_fit_score', e.target.value)} /></label>
          <label>Geography<input className="input" placeholder="Global, MENA, Europe..." value={form.region} onChange={e => updateField('region', e.target.value)} /></label>
          <label>Country<input className="input" value={form.country} onChange={e => updateField('country', e.target.value)} /></label>
          <label>Website<input className="input" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} /></label>
          <label>LinkedIn<input className="input" value={form.linkedin_company_url} onChange={e => updateField('linkedin_company_url', e.target.value)} /></label>
          <label>AwesomeFinTech/category URL<input className="input" value={form.source_url} onChange={e => updateField('source_url', e.target.value)} /></label>
          <label>Recommended functions<input className="input" value={form.recommended_functions} onChange={e => updateField('recommended_functions', e.target.value)} /></label>
        </div>
        <label>Market notes / rationale<textarea className="textarea" value={form.rationale} onChange={e => updateField('rationale', e.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions"><button className="btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save company'}</button></div>
      </form>
    </div>}
  </>;
}
