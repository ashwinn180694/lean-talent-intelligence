'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import CompanyCard from './CompanyCard';
import { supabase } from '@/lib/supabase-browser';
import { readCompanyCache, writeCompanyCache } from '@/lib/cache';
import { cleanUrl, MARKET_CATEGORIES, PRIORITY_TIERS } from '@/lib/market';
import type { Company } from '@/lib/types';

const EMPTY_FORM = {
  name: '',
  sub_sector: 'Global Fintech',
  priority_tier: 'Tier 2',
  region: 'Global',
  country: '',
  lean_fit_score: '',
  website_url: '',
  linkedin_company_url: '',
  recommended_functions: 'Engineering, Product, Commercial, Partnerships, Risk/Compliance',
  rationale: ''
};

export default function CompaniesGrid() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [tier, setTier] = useState('All');
  const [region, setRegion] = useState('All');

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const cached = readCompanyCache<Company>();
    if (cached) { setCompanies(cached); setLoading(false); }
    fetchCompanies(!!cached);
  }, []);

  async function fetchCompanies(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('priority_tier')
      .order('name');
    if (data) {
      setCompanies(data as Company[]);
      writeCompanyCache(data as Company[]);
    }
    setLoading(false);
    setRefreshing(false);
  }

  const regions = useMemo(
    () => Array.from(new Set(companies.map(c => c.region).filter(Boolean) as string[])).sort(),
    [companies]
  );

  const filtered = useMemo(
    () =>
      companies.filter(c => {
        const hay = `${c.name} ${c.sub_sector} ${c.region} ${c.country} ${c.hq} ${c.rationale}`.toLowerCase();
        return (
          hay.includes(q.toLowerCase()) &&
          (category === 'All' || (c.sub_sector || 'Global Fintech') === category) &&
          (tier === 'All' || c.priority_tier === tier) &&
          (region === 'All' || c.region === region)
        );
      }),
    [companies, q, category, tier, region]
  );

  const hasFilters = q || category !== 'All' || tier !== 'All' || region !== 'All';

  async function addCompany(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    if (!form.name.trim()) { setAddError('Company name is required.'); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: form.name.trim(),
        sub_sector: form.sub_sector || null,
        sector: 'FinTech',
        priority_tier: form.priority_tier || null,
        region: form.region || null,
        country: form.country.trim() || null,
        lean_fit_score: form.lean_fit_score ? Number(form.lean_fit_score) : null,
        website_url: cleanUrl(form.website_url),
        linkedin_company_url: cleanUrl(form.linkedin_company_url),
        recommended_functions: form.recommended_functions.trim() || null,
        rationale: form.rationale.trim() || null,
        source: 'Manual'
      })
      .select('*')
      .single();
    setSaving(false);
    if (error) { setAddError(error.message); return; }
    if (data) {
      const updated = [data as Company, ...companies].sort((a, b) => a.name.localeCompare(b.name));
      setCompanies(updated);
      writeCompanyCache(updated);
    }
    setForm(EMPTY_FORM);
    setShowAdd(false);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${filtered.length} of ${companies.length} companies`}
            {refreshing && <span className="ml-2 text-xs text-brand">Refreshing…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchCompanies(true)}
            disabled={refreshing}
            className="btn-secondary"
            title="Refresh"
          >
            <RotateCcw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} /> Add Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <label className="field-label">Search</label>
          <input
            className="field-input"
            placeholder="Company name, country, category…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="min-w-40">
          <label className="field-label">Category</label>
          <select className="field-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="All">All categories</option>
            {MARKET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="min-w-36">
          <label className="field-label">Geography</label>
          <select className="field-select" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="All">All regions</option>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="min-w-32">
          <label className="field-label">Priority</label>
          <select className="field-select" value={tier} onChange={e => setTier(e.target.value)}>
            <option value="All">All tiers</option>
            {PRIORITY_TIERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setQ(''); setCategory('All'); setTier('All'); setRegion('All'); }}
            className="btn-secondary"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse space-y-3">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500 text-sm">No companies match these filters.</p>
          {hasFilters && (
            <button
              onClick={() => { setQ(''); setCategory('All'); setTier('All'); setRegion('All'); }}
              className="mt-3 btn-secondary"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => <CompanyCard key={c.id} company={c} />)}
        </div>
      )}

      {/* Add company modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={addCompany} className="card w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Add Company</h2>
                <p className="text-xs text-slate-500">All fields can be edited on the company page later.</p>
              </div>
              <button type="button" onClick={() => { setShowAdd(false); setAddError(''); }} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="field-label">Company name *</label>
                <input className="field-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="field-label">Category</label>
                <select className="field-select" value={form.sub_sector} onChange={e => setForm(f => ({ ...f, sub_sector: e.target.value }))}>
                  {MARKET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Priority tier</label>
                <select className="field-select" value={form.priority_tier} onChange={e => setForm(f => ({ ...f, priority_tier: e.target.value }))}>
                  {PRIORITY_TIERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Region</label>
                <input className="field-input" placeholder="Global, MENA, Europe…" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Country</label>
                <input className="field-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Fit score (1–10)</label>
                <input className="field-input" type="number" min={1} max={10} value={form.lean_fit_score} onChange={e => setForm(f => ({ ...f, lean_fit_score: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Website</label>
                <input className="field-input" placeholder="https://…" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="field-label">LinkedIn</label>
                <input className="field-input" placeholder="https://linkedin.com/company/…" value={form.linkedin_company_url} onChange={e => setForm(f => ({ ...f, linkedin_company_url: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="field-label">Rationale / notes</label>
                <textarea className="field-input min-h-20 resize-none" value={form.rationale} onChange={e => setForm(f => ({ ...f, rationale: e.target.value }))} />
              </div>
            </div>
            {addError && (
              <div className="mx-6 mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{addError}</div>
            )}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? 'Saving…' : 'Save company'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
