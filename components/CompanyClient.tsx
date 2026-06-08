'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Plus, X, Globe2, Layers3, Trash2 } from 'lucide-react';
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
  sub_sector: 'Global Fintech',
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


const ALLOWED_COMPANY_CATEGORIES = [
  'Payments',
  'Remittance',
  'Lending',
  'Trading, Crypto & Investing',
  'Payments Infrastructure',
  'OpenBanking',
  'KSA',
  'UAE',
  'Global Fintech',
  'Big Tech'
];

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
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Company | null>(null);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

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
    ...ALLOWED_COMPANY_CATEGORIES.map(name => ({ name, q: '', tier: 'All', region: 'All', category: name })),
    { name: 'Tier 1', q: '', tier: 'Tier 1', region: 'All', category: 'All' }
  ];

  function applyFilter(f: { q: string; tier: string; region: string; category: string }) {
    setQ(f.q);
    setTier(f.tier);
    setRegion(f.region);
    setCategory(f.category);
  }

  const regions = useMemo(() => Array.from(new Set(allCompanies.map(c => c.region).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)), [allCompanies]);
  const categories = ALLOWED_COMPANY_CATEGORIES;
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    ALLOWED_COMPANY_CATEGORIES.forEach(cat => map.set(cat, 0));
    allCompanies.forEach(c => {
      const cat = c.sub_sector || 'Global Fintech';
      if (ALLOWED_COMPANY_CATEGORIES.includes(cat)) map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).filter(([, count]) => count > 0).sort((a,b) => b[1] - a[1]);
  }, [allCompanies]);

  const rows = useMemo(() => allCompanies.filter(c => {
    const companyCategory = c.sub_sector || 'Global Fintech';
    if (!ALLOWED_COMPANY_CATEGORIES.includes(companyCategory)) return false;
    const hay = `${c.name} ${c.sector} ${c.sub_sector} ${c.region} ${c.country} ${c.rationale} ${c.awesomefintech_categories}`.toLowerCase();
    return hay.includes(q.toLowerCase())
      && (tier === 'All' || c.priority_tier === tier)
      && (region === 'All' || c.region === region)
      && (category === 'All' || companyCategory === category);
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
      source: 'Manual company',
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


  async function removeCompany() {
    if (!pendingDelete) return;
    setDeleteError('');
    setDeleting(true);
    const { error } = await supabase.from('companies').delete().eq('id', pendingDelete.id);
    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    setAllCompanies(prev => {
      const next = prev.filter(c => c.id !== pendingDelete.id);
      try {
        const serialized = JSON.stringify(next);
        sessionStorage.setItem('lean_cache_companies_v2_awesomefintech', serialized);
        localStorage.setItem('lean_cache_companies_v2_awesomefintech', serialized);
      } catch {}
      return next;
    });
    setPendingDelete(null);
    router.refresh();
  }

  const totalTier1 = allCompanies.filter(c => c.priority_tier === 'Tier 1').length;

  return <>
    <section className="company-page-shell">
      <div className="company-page-header card">
        <div className="company-header-copy">
          <div className="eyebrow"><Globe2 size={15}/> FinTech company map</div>
          <h2>Focused company universe</h2>
          <p className="muted">A streamlined sourcing map built around Lean's priority markets and talent pools. Use the category cards, filters and search to move quickly without horizontal scrolling.</p>
        </div>
        <div className="company-header-actions">
          <button className="btn" onClick={() => setShowAdd(true)}><Plus size={16}/> Add Company</button>
        </div>
      </div>

      <div className="company-metrics-row">
        <button className={`company-metric-card card ${category === 'All' ? 'active' : ''}`} onClick={() => setCategory('All')}>
          <span>Total companies</span><strong>{allCompanies.length}</strong><em>All focused categories</em>
        </button>
        <button className={`company-metric-card card ${tier === 'Tier 1' ? 'active' : ''}`} onClick={() => setTier(tier === 'Tier 1' ? 'All' : 'Tier 1')}>
          <span>Tier 1</span><strong>{totalTier1}</strong><em>Highest-priority targets</em>
        </button>
        <button className="company-metric-card card" onClick={() => { setQ(''); setTier('All'); setRegion('All'); setCategory('All'); }}>
          <span>Current view</span><strong>{rows.length}</strong><em>Visible after filters</em>
        </button>
      </div>

      <div className="focused-category-panel card">
        <div className="section-heading-row">
          <div>
            <h3>Priority categories</h3>
            <p className="muted">Only these categories are available as filters.</p>
          </div>
          {(category !== 'All') && <button className="btn secondary" onClick={() => setCategory('All')}>Show all</button>}
        </div>
        <div className="focused-category-grid">
          {ALLOWED_COMPANY_CATEGORIES.map(name => {
            const count = categoryCounts.find(([cat]) => cat === name)?.[1] || 0;
            return <button key={name} className={`focused-category-card ${category === name ? 'active' : ''}`} onClick={() => setCategory(name)}>
              <span>{name}</span>
              <strong>{count}</strong>
              <em>companies</em>
            </button>;
          })}
        </div>
      </div>

      <div className="company-filter-card card">
        <div className="company-filter-header">
          <div>
            <h3>Find companies</h3>
            <p className="muted">Search by company name, category, country, source notes or rationale.</p>
          </div>
          <button className="btn secondary" onClick={saveCurrentFilter}>Save view</button>
        </div>
        <div className="company-filter-grid">
          <input className="input" placeholder="Search companies, markets, countries..." value={q} onChange={e => setQ(e.target.value)} />
          <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="All">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="All">All geography</option>{regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="select" value={tier} onChange={e => setTier(e.target.value)}>
            <option>All</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option>
          </select>
          {(q || tier !== 'All' || region !== 'All' || category !== 'All') && <button className="btn secondary" onClick={() => { setQ(''); setTier('All'); setRegion('All'); setCategory('All'); }}>Clear filters</button>}
        </div>
        {(savedFilters.length > 0) && <div className="saved-filter-strip compact-saved-views">{savedFilters.map(f => <button key={f.name} className="filter-chip" onClick={() => applyFilter(f)}>{f.name}</button>)}</div>}
      </div>

      <div className="company-results-header">
        <div>
          <h3>Company results</h3>
          <p className="muted">Showing {rows.length} of {allCompanies.length} companies</p>
        </div>
      </div>

      <div className="company-results-grid">
        {rows.map(c => <div key={c.id} className="card company-card clickable-card fintech-company-card redesigned-company-card">
          <Link href={`/companies/${c.id}`} prefetch className="company-main-link" aria-label={`Open ${c.name} profile`} onClick={() => { try { sessionStorage.setItem(`lean_company_${c.id}`, JSON.stringify(c)); } catch {} }}>
            <div className="company-card-topline">
              <div className="card-title">{c.name}</div>
              <span className={`pill ${(c.priority_tier || '').replace(' ', '').toLowerCase()}`}>{c.priority_tier || 'Unassigned'}</span>
            </div>
            <div className="company-card-meta">
              <span>{c.sub_sector || c.sector || 'FinTech'}</span>
              <span>{c.region || 'Global'}</span>
              <span>Fit {c.lean_fit_score || '-'}</span>
            </div>
            <div className="source-mini">{sourceLabel(c)}</div>
          </Link>
          <div className="company-card-actions" onClick={e => e.stopPropagation()}>
            <a className="btn secondary" href={c.website_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!c.website_url} onClick={e => { if (!c.website_url) e.preventDefault(); }}>Website <ExternalLink size={14}/></a>
            <a className="btn secondary" href={c.linkedin_company_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!c.linkedin_company_url} onClick={e => { if (!c.linkedin_company_url) e.preventDefault(); }}>LinkedIn <ExternalLink size={14}/></a>
            <button className="btn secondary danger-btn" type="button" onClick={() => { setPendingDelete(c); setDeleteError(''); }}>Remove <Trash2 size={14}/></button>
          </div>
        </div>)}
      </div>
    </section>


    {pendingDelete && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card delete-confirm-modal">
        <div className="modal-header">
          <div>
            <h2>Remove company?</h2>
            <p className="muted">This will remove <strong>{pendingDelete.name}</strong> from the company universe. Existing candidate records will stay in the database but may no longer be attached to this company.</p>
          </div>
          <button className="icon-btn" type="button" onClick={() => { setPendingDelete(null); setDeleteError(''); }} aria-label="Close"><X size={20}/></button>
        </div>
        {deleteError && <div className="error">{deleteError}</div>}
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={() => { setPendingDelete(null); setDeleteError(''); }} disabled={deleting}>Cancel</button>
          <button className="btn danger" type="button" onClick={removeCompany} disabled={deleting}>{deleting ? 'Removing...' : 'Remove company'}</button>
        </div>
      </div>
    </div>}

    {showAdd && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={addCompany}>
        <div className="modal-header"><div><h2>Add Company</h2><p className="muted">Add a company to the fintech market map. Website/LinkedIn can be edited later.</p></div><button className="icon-btn" type="button" onClick={() => { setShowAdd(false); setError(''); }} aria-label="Close"><X size={20}/></button></div>
        <div className="form-grid">
          <label>Company name<input className="input" value={form.name} onChange={e => updateField('name', e.target.value)} required /></label>
          <label>Category<select className="select" value={form.sub_sector} onChange={e => updateField('sub_sector', e.target.value)}>{ALLOWED_COMPANY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></label>
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
