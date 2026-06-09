'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Plus, X, Trash2, ChevronUp, ChevronDown, Sparkles, CheckCircle2, Loader2, Save } from 'lucide-react';
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

const COMPANY_CACHE_KEYS = [
  'lean_cache_companies_current',
  'lean_cache_companies_v1',
  'lean_cache_companies_v2_awesomefintech'
];

function writeCompanyCaches(companies: Company[]) {
  try {
    const serialized = JSON.stringify(companies);
    COMPANY_CACHE_KEYS.forEach(key => {
      sessionStorage.setItem(key, serialized);
      localStorage.setItem(key, serialized);
    });
  } catch {}
}

function clearCompanyCaches() {
  try {
    COMPANY_CACHE_KEYS.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  } catch {}
}

function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

function categoryClass(category?: string | null) {
  return (category || 'Global Fintech').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function fitTone(score?: number | null) {
  if (!score) return 'neutral';
  if (score >= 8) return 'high';
  if (score >= 5) return 'mid';
  return 'low';
}

function sourceLabel(c: Company) {
  return c.awesomefintech_rank || c.source || 'Fintech universe';
}

function EditableText({ label, value, onChange, placeholder = '', multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean }) {
  return <label className="inline-edit-field">
    <span>{label}</span>
    {multiline
      ? <textarea className="inline-edit-input textarea-like" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      : <input className="inline-edit-input" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
  </label>;
}

function EditableSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="inline-edit-field">
    <span>{label}</span>
    <select className="inline-edit-input" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;
}

export default function CompanyClient({ companies, onCompaniesChange }: { companies: Company[]; onCompaniesChange?: (companies: Company[]) => void }) {
  const [allCompanies, setAllCompanies] = useState<Company[]>(companies);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('All');
  const [region, setRegion] = useState('All');
  const [category, setCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Company | null>(null);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(companies[0]?.id || null);
  const [draft, setDraft] = useState<Company | null>(companies[0] || null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAllCompanies(companies);
    writeCompanyCaches(companies);
    if (!selectedId && companies[0]) {
      setSelectedId(companies[0].id);
      setDraft(companies[0]);
    }
  }, [companies, selectedId]);

  const regions = useMemo(() => Array.from(new Set(allCompanies.map(c => c.region).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)), [allCompanies]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    ALLOWED_COMPANY_CATEGORIES.forEach(cat => map.set(cat, 0));
    allCompanies.forEach(c => {
      const cat = c.sub_sector || 'Global Fintech';
      if (ALLOWED_COMPANY_CATEGORIES.includes(cat)) map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  }, [allCompanies]);

  const rows = useMemo(() => allCompanies.filter(c => {
    const companyCategory = c.sub_sector || 'Global Fintech';
    if (!ALLOWED_COMPANY_CATEGORIES.includes(companyCategory)) return false;
    const hay = `${c.name} ${c.sector} ${c.sub_sector} ${c.region} ${c.country} ${c.hq} ${c.rationale} ${c.awesomefintech_categories}`.toLowerCase();
    return hay.includes(q.toLowerCase())
      && (tier === 'All' || c.priority_tier === tier)
      && (region === 'All' || c.region === region)
      && (category === 'All' || companyCategory === category);
  }), [allCompanies, q, tier, region, category]);

  const selectedIndex = rows.findIndex(c => c.id === selectedId);
  const selectedCompany = rows[selectedIndex] || rows[0] || null;

  useEffect(() => {
    if (!selectedCompany) {
      setDraft(null);
      return;
    }
    if (selectedCompany.id !== selectedId) setSelectedId(selectedCompany.id);
    setDraft(selectedCompany);
  }, [selectedCompany?.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
      if (isTyping || showAdd || pendingDelete) return;
      if (!rows.length) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const next = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, rows.length - 1);
        selectCompany(rows[next]);
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const prev = selectedIndex < 0 ? 0 : Math.max(selectedIndex - 1, 0);
        selectCompany(rows[prev]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rows, selectedIndex, showAdd, pendingDelete]);

  function selectCompany(company: Company) {
    setSelectedId(company.id);
    setDraft(company);
    try { sessionStorage.setItem(`lean_company_${company.id}`, JSON.stringify(company)); } catch {}
    requestAnimationFrame(() => {
      const node = listRef.current?.querySelector(`[data-company-id="${company.id}"]`);
      node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function updateField(field: keyof CompanyForm, value: string) { setForm(prev => ({ ...prev, [field]: value })); }

  function updateDraft<K extends keyof Company>(field: K, value: Company[K]) {
    if (!draft) return;
    const next = { ...draft, [field]: value } as Company;
    setDraft(next);
    setAllCompanies(prev => {
      const updated = prev.map(c => c.id === next.id ? next : c);
      writeCompanyCaches(updated);
      return updated;
    });
    setHasUnsavedChanges(true);
    scheduleAutosave(next);
  }

  function scheduleAutosave(company: Company) {
    setSaveState('saving');
    setSaveMessage('Saving changes...');
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveCompany(company), 700);
  }

  async function saveCompany(company: Company) {
    setSaveState('saving');
    setSaveMessage('Saving to Supabase...');
    if (!company?.id) {
      setSaveState('error');
      setSaveMessage('Missing company ID. Refresh and try again.');
      return;
    }

    const rawScore = company.lean_fit_score as number | string | null | undefined;
    const score = rawScore === null || rawScore === undefined || String(rawScore).trim() === ''
      ? null
      : Number(rawScore);

    const updates = {
      name: company.name?.trim() || 'Untitled company',
      sector: company.sector || 'FinTech',
      sub_sector: company.sub_sector || 'Global Fintech',
      region: company.region || 'Global',
      country: company.country || null,
      hq: company.hq || null,
      website_url: company.website_url ? cleanUrl(String(company.website_url)) : null,
      linkedin_company_url: company.linkedin_company_url ? cleanUrl(String(company.linkedin_company_url)) : null,
      lean_fit_score: Number.isFinite(score as number) ? score : null,
      priority_tier: company.priority_tier || null,
      recommended_functions: company.recommended_functions || null,
      rationale: company.rationale || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', company.id)
      .select('*')
      .single();

    if (error) {
      setSaveState('error');
      setSaveMessage(`Save failed: ${error.message}`);
      setHasUnsavedChanges(true);
      console.error('Company autosave failed', error);
      return;
    }

    if (!data) {
      setSaveState('error');
      setSaveMessage('Save failed: Supabase did not update this company. Please check company update permissions.');
      setHasUnsavedChanges(true);
      return;
    }

    const saved = data as Company;
    setDraft(saved);
    setAllCompanies(prev => {
      const updated = prev.map(c => c.id === saved.id ? saved : c);
      writeCompanyCaches(updated);
      onCompaniesChange?.(updated);
      return updated;
    });
    try { sessionStorage.setItem(`lean_company_${saved.id}`, JSON.stringify(saved)); } catch {}
    setHasUnsavedChanges(false);
    setSaveState('saved');
    setSaveMessage('Saved to Supabase');
    window.setTimeout(() => setSaveState('idle'), 1400);
  }

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
    if (data) {
      const company = data as Company;
      setAllCompanies(prev => {
        const next = [company, ...prev].sort((a, b) => a.name.localeCompare(b.name));
        writeCompanyCaches(next);
        onCompaniesChange?.(next);
        return next;
      });
      selectCompany(company);
    }
    setForm(emptyForm); setShowAdd(false);
  }

  async function removeCompany() {
    if (!pendingDelete) return;
    const companyToDelete = pendingDelete;
    const previousRows = rows;
    const previousIndex = previousRows.findIndex(c => c.id === companyToDelete.id);
    setDeleteError('');
    setDeleting(true);

    const detachResult = await supabase.from('candidates').update({ company_id: null }).eq('company_id', companyToDelete.id);
    if (detachResult.error) {
      setDeleting(false);
      setDeleteError(`Could not detach linked candidates: ${detachResult.error.message}`);
      return;
    }

    const { data: deletedRows, error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyToDelete.id)
      .select('id');

    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    if (!deletedRows || deletedRows.length === 0) {
      setDeleteError('No company was deleted in Supabase. Please refresh and try again.');
      return;
    }

    const nextAll = allCompanies.filter(c => c.id !== companyToDelete.id);
    const nextVisibleRows = previousRows.filter(c => c.id !== companyToDelete.id);
    const replacement = nextVisibleRows[Math.min(Math.max(previousIndex, 0), nextVisibleRows.length - 1)] || nextAll[0] || null;

    clearCompanyCaches();
    writeCompanyCaches(nextAll);
    setAllCompanies(nextAll);
    onCompaniesChange?.(nextAll);
    setSelectedId(replacement?.id || null);
    setDraft(replacement);
    try { sessionStorage.removeItem(`lean_company_${companyToDelete.id}`); } catch {}
    setPendingDelete(null);
    setSaveState('saved');
    setSaveMessage('Company deleted from Supabase');
    window.setTimeout(() => setSaveState('idle'), 1600);
  }

  const totalTier1 = allCompanies.filter(c => c.priority_tier === 'Tier 1').length;

  return <>
    <section className="company-workspace-shell">
      <div className="company-workspace-hero card">
        <div>
          <div className="eyebrow"><Sparkles size={15}/> Talent Intelligence Workspace</div>
          <h2>Company universe</h2>
          <p className="muted">Move with arrow keys, edit directly, and let changes auto-save into Supabase.</p>
        </div>
        <div className="company-header-actions">
          <button className="btn" onClick={() => setShowAdd(true)}><Plus size={16}/> Add Company</button>
        </div>
      </div>

      <div className="workspace-summary-row">
        <button className={`workspace-stat ${category === 'All' ? 'active' : ''}`} onClick={() => setCategory('All')}><span>Total</span><strong>{allCompanies.length}</strong></button>
        <button className={`workspace-stat ${tier === 'Tier 1' ? 'active' : ''}`} onClick={() => setTier(tier === 'Tier 1' ? 'All' : 'Tier 1')}><span>Tier 1</span><strong>{totalTier1}</strong></button>
        <button className="workspace-stat" onClick={() => { setQ(''); setTier('All'); setRegion('All'); setCategory('All'); }}><span>Visible</span><strong>{rows.length}</strong></button>
      </div>

      <div className="workspace-filter-panel card">
        <input className="input workspace-search" placeholder="Search company, country, category..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="select" value={category} onChange={e => setCategory(e.target.value)}><option value="All">All categories</option>{ALLOWED_COMPANY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select className="select" value={region} onChange={e => setRegion(e.target.value)}><option value="All">All geography</option>{regions.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <select className="select" value={tier} onChange={e => setTier(e.target.value)}><option>All</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select>
        <button className="btn secondary" onClick={() => { setQ(''); setTier('All'); setRegion('All'); setCategory('All'); }}>Reset</button>
      </div>

      <div className="category-chip-row">
        {ALLOWED_COMPANY_CATEGORIES.map(name => {
          const count = categoryCounts.find(([cat]) => cat === name)?.[1] || 0;
          return <button key={name} className={`category-chip-v9 ${categoryClass(name)} ${category === name ? 'active' : ''}`} onClick={() => setCategory(name)}>
            <span>{name}</span><strong>{count}</strong>
          </button>;
        })}
      </div>

      <div className="company-master-detail card">
        <div className="company-list-pane">
          <div className="pane-header">
            <div><strong>{rows.length}</strong><span> companies</span></div>
            <div className="arrow-help"><ChevronUp size={14}/><ChevronDown size={14}/> arrow keys</div>
          </div>
          <div className="company-list-scroll" ref={listRef}>
            {rows.map(c => <button key={c.id} data-company-id={c.id} className={`company-row-card ${selectedId === c.id ? 'active' : ''}`} onClick={() => selectCompany(c)}>
              <div className="row-title-line"><strong>{c.name}</strong><span className={`fit-dot ${fitTone(c.lean_fit_score)}`}>{c.lean_fit_score || '-'}</span></div>
              <div className="row-meta-line"><span className={`category-mini ${categoryClass(c.sub_sector)}`}>{c.sub_sector || 'Global Fintech'}</span><span>{c.region || 'Global'}</span></div>
            </button>)}
            {rows.length === 0 && <div className="empty-state">No companies match this view.</div>}
          </div>
        </div>

        <div className="company-detail-pane">
          {draft ? <>
            <div className="detail-hero-card">
              <div className="detail-title-block">
                <div className={`category-orb ${categoryClass(draft.sub_sector)}`}></div>
                <div>
                  <input className="company-title-input" value={draft.name || ''} onChange={e => updateDraft('name', e.target.value)} />
                  <div className="detail-subtitle">{draft.country || draft.region || 'Global'} · {sourceLabel(draft)}</div>
                </div>
              </div>
              <div className="save-indicator">
                {saveState === 'saving' && <><Loader2 size={15} className="spin"/> {saveMessage || 'Saving to Supabase...'}</>}
                {saveState === 'saved' && <><CheckCircle2 size={15}/> {saveMessage || 'Saved to Supabase'}</>}
                {saveState === 'error' && <span className="save-error">{saveMessage}</span>}
                {saveState === 'idle' && hasUnsavedChanges && <span className="save-pending">Unsaved changes</span>}
              </div>
            </div>

            <div className="company-action-strip">
              <a className="btn secondary" href={draft.website_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!draft.website_url} onClick={e => { if (!draft.website_url) e.preventDefault(); }}>Website <ExternalLink size={14}/></a>
              <a className="btn secondary" href={draft.linkedin_company_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!draft.linkedin_company_url} onClick={e => { if (!draft.linkedin_company_url) e.preventDefault(); }}>LinkedIn <ExternalLink size={14}/></a>
              <button className="btn secondary" type="button" onClick={() => draft && saveCompany(draft)} disabled={saveState === 'saving'}><Save size={14}/> Save now</button>
              <button className="btn secondary danger-btn" onClick={() => { setPendingDelete(draft); setDeleteError(''); }}>Remove <Trash2 size={14}/></button>
            </div>

            <div className="inline-edit-grid">
              <EditableSelect label="Category" value={draft.sub_sector || 'Global Fintech'} onChange={value => updateDraft('sub_sector', value)} options={ALLOWED_COMPANY_CATEGORIES} />
              <EditableSelect label="Priority" value={draft.priority_tier || 'Tier 2'} onChange={value => updateDraft('priority_tier', value)} options={['Tier 1', 'Tier 2', 'Tier 3']} />
              <label className="inline-edit-field"><span>Fit score</span><input className={`inline-edit-input fit-${fitTone(draft.lean_fit_score)}`} type="number" min="1" max="10" value={draft.lean_fit_score || ''} onChange={e => updateDraft('lean_fit_score', e.target.value ? Number(e.target.value) : null)} /></label>
              <EditableText label="Region" value={draft.region || ''} onChange={value => updateDraft('region', value)} />
              <EditableText label="Country" value={draft.country || ''} onChange={value => updateDraft('country', value)} />
              <EditableText label="HQ" value={draft.hq || ''} onChange={value => updateDraft('hq', value)} />
              <EditableText label="Website" value={draft.website_url || ''} onChange={value => updateDraft('website_url', value)} />
              <EditableText label="LinkedIn" value={draft.linkedin_company_url || ''} onChange={value => updateDraft('linkedin_company_url', value)} />
              <EditableText label="Functions" value={draft.recommended_functions || ''} onChange={value => updateDraft('recommended_functions', value)} />
              <EditableText label="Notes / rationale" value={draft.rationale || ''} onChange={value => updateDraft('rationale', value)} multiline />
            </div>
          </> : <div className="empty-state roomy"><h3>No company selected</h3><p className="muted">Choose a company from the list to start editing.</p></div>}
        </div>
      </div>
    </section>

    {pendingDelete && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card delete-confirm-modal">
        <div className="modal-header">
          <div><h2>Remove company?</h2><p className="muted">This permanently deletes <strong>{pendingDelete.name}</strong> from Supabase. Existing candidate records stay, but they will be detached from this company.</p></div>
          <button className="icon-btn" type="button" onClick={() => { setPendingDelete(null); setDeleteError(''); }} aria-label="Close"><X size={20}/></button>
        </div>
        {deleteError && <div className="error">{deleteError}</div>}
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={() => { setPendingDelete(null); setDeleteError(''); }} disabled={deleting}>Cancel</button>
          <button className="btn danger" type="button" onClick={removeCompany} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete permanently'}</button>
        </div>
      </div>
    </div>}

    {showAdd && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={addCompany}>
        <div className="modal-header"><div><h2>Add Company</h2><p className="muted">Add a company to the fintech market map. All fields can be edited inline later.</p></div><button className="icon-btn" type="button" onClick={() => { setShowAdd(false); setError(''); }} aria-label="Close"><X size={20}/></button></div>
        <div className="form-grid">
          <label>Company name<input className="input" value={form.name} onChange={e => updateField('name', e.target.value)} required /></label>
          <label>Category<select className="select" value={form.sub_sector} onChange={e => updateField('sub_sector', e.target.value)}>{ALLOWED_COMPANY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></label>
          <label>Priority tier<select className="select" value={form.priority_tier} onChange={e => updateField('priority_tier', e.target.value)}><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select></label>
          <label>Lean fit score<input className="input" type="number" min="1" max="10" value={form.lean_fit_score} onChange={e => updateField('lean_fit_score', e.target.value)} /></label>
          <label>Geography<input className="input" placeholder="Global, MENA, Europe..." value={form.region} onChange={e => updateField('region', e.target.value)} /></label>
          <label>Country<input className="input" value={form.country} onChange={e => updateField('country', e.target.value)} /></label>
          <label>Website<input className="input" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} /></label>
          <label>LinkedIn<input className="input" value={form.linkedin_company_url} onChange={e => updateField('linkedin_company_url', e.target.value)} /></label>
          <label>Source URL<input className="input" value={form.source_url} onChange={e => updateField('source_url', e.target.value)} /></label>
          <label>Recommended functions<input className="input" value={form.recommended_functions} onChange={e => updateField('recommended_functions', e.target.value)} /></label>
        </div>
        <label>Market notes / rationale<textarea className="textarea" value={form.rationale} onChange={e => updateField('rationale', e.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions"><button className="btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save company'}</button></div>
      </form>
    </div>}
  </>;
}
