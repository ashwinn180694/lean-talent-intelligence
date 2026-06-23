'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, ExternalLink, Globe, Linkedin, Loader2, Save, Trash2, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import { writeCompanyCache, readCompanyCache, clearCompanyCache } from '@/lib/cache';
import { cleanUrl, FIT_COLORS, fitTone, MARKET_CATEGORIES, PRIORITY_TIERS, TIER_COLORS } from '@/lib/market';
import type { Company } from '@/lib/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function CompanyDetailClient({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [draft, setDraft] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      // Try cache first
      const cache = readCompanyCache<Company>();
      const cached = cache?.find(c => c.id === companyId);
      if (cached) { setCompany(cached); setDraft(cached); setLoading(false); }

      const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
      if (data) {
        setCompany(data as Company);
        setDraft(data as Company);
        // Update cache
        const all = readCompanyCache<Company>() || [];
        const updated = all.map(c => c.id === companyId ? (data as Company) : c);
        writeCompanyCache(updated);
      }
      setLoading(false);
    }
    load();
  }, [companyId]);

  function updateDraft<K extends keyof Company>(field: K, value: Company[K]) {
    setDraft(prev => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      scheduleAutosave(next);
      return next;
    });
  }

  function scheduleAutosave(next: Company) {
    setSaveState('saving');
    setSaveMsg('Saving…');
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => persistCompany(next), 700);
  }

  async function persistCompany(c: Company) {
    setSaveState('saving');
    setSaveMsg('Saving to Supabase…');
    const updates = {
      name: c.name?.trim() || 'Untitled',
      sector: c.sector || 'FinTech',
      sub_sector: c.sub_sector || null,
      region: c.region || null,
      country: c.country || null,
      hq: c.hq || null,
      website_url: c.website_url ? cleanUrl(String(c.website_url)) : null,
      linkedin_company_url: c.linkedin_company_url ? cleanUrl(String(c.linkedin_company_url)) : null,
      lean_fit_score: c.lean_fit_score != null && String(c.lean_fit_score).trim() !== '' ? Number(c.lean_fit_score) : null,
      priority_tier: c.priority_tier || null,
      recommended_functions: c.recommended_functions || null,
      rationale: c.rationale || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('companies').update(updates).eq('id', c.id).select('*').single();
    if (error || !data) {
      setSaveState('error');
      setSaveMsg(error?.message || 'Save failed');
      return;
    }
    const saved = data as Company;
    setCompany(saved);
    setDraft(saved);
    // Update cache
    const all = readCompanyCache<Company>() || [];
    writeCompanyCache(all.map(x => x.id === saved.id ? saved : x));
    setSaveState('saved');
    setSaveMsg('Saved');
    setTimeout(() => setSaveState('idle'), 1500);
  }

  async function deleteCompany() {
    if (!draft) return;
    setDeleting(true);
    setDeleteError('');
    await supabase.from('candidates').update({ company_id: null }).eq('company_id', draft.id);
    const { error } = await supabase.from('companies').delete().eq('id', draft.id);
    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    clearCompanyCache();
    window.location.href = '/companies';
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="card p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 animate-pulse rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="p-6">
        <Link href="/companies" className="flex items-center gap-1.5 text-sm text-brand hover:underline mb-4">
          <ArrowLeft size={14} /> Back to companies
        </Link>
        <div className="card p-12 text-center">
          <p className="text-slate-500">Company not found.</p>
        </div>
      </div>
    );
  }

  const fitKey = fitTone(draft.lean_fit_score);

  return (
    <div className="p-6 space-y-5">
      {/* Back */}
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
        <ArrowLeft size={14} /> Back to companies
      </Link>

      {/* Hero card */}
      <div className="card px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <input
              className="text-xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand focus:outline-none w-full pb-0.5 transition"
              value={draft.name || ''}
              onChange={e => updateDraft('name', e.target.value)}
            />
            <p className="mt-1 text-sm text-slate-500">
              {draft.sub_sector || 'Global Fintech'} · {draft.country || draft.region || 'Global'}
              {draft.hq ? ` · ${draft.hq}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {draft.lean_fit_score != null && (
              <span className={`badge text-sm px-2.5 py-1 ${FIT_COLORS[fitKey]}`}>
                Fit {draft.lean_fit_score}
              </span>
            )}
            {draft.priority_tier && (
              <span className={`badge text-sm px-2.5 py-1 ${TIER_COLORS[draft.priority_tier] ?? 'bg-slate-100 text-slate-600'}`}>
                {draft.priority_tier}
              </span>
            )}
          </div>
        </div>

        {/* Action strip */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          {draft.website_url && (
            <a href={draft.website_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs gap-1.5">
              <Globe size={13} /> Website <ExternalLink size={11} />
            </a>
          )}
          {draft.linkedin_company_url && (
            <a href={draft.linkedin_company_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs gap-1.5">
              <Linkedin size={13} /> LinkedIn <ExternalLink size={11} />
            </a>
          )}
          <button
            onClick={() => draft && persistCompany(draft)}
            disabled={saveState === 'saving'}
            className="btn-secondary text-xs gap-1.5"
          >
            <Save size={13} /> Save now
          </button>
          <button
            onClick={() => setPendingDelete(true)}
            className="btn-secondary text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 size={13} /> Remove
          </button>

          {/* Save indicator */}
          <div className="ml-auto flex items-center gap-1.5 text-xs">
            {saveState === 'saving' && <><Loader2 size={13} className="animate-spin text-slate-400" /><span className="text-slate-400">{saveMsg}</span></>}
            {saveState === 'saved' && <><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-emerald-600">{saveMsg}</span></>}
            {saveState === 'error' && <span className="text-red-600">{saveMsg}</span>}
          </div>
        </div>
      </div>

      {/* Edit fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Classification</h2>
          <Field label="Category">
            <select className="field-select" value={draft.sub_sector || 'Global Fintech'} onChange={e => updateDraft('sub_sector', e.target.value)}>
              {MARKET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Priority tier">
            <select className="field-select" value={draft.priority_tier || 'Tier 2'} onChange={e => updateDraft('priority_tier', e.target.value)}>
              {PRIORITY_TIERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Fit score (1–10)">
            <input
              className="field-input"
              type="number"
              min={1}
              max={10}
              value={draft.lean_fit_score ?? ''}
              onChange={e => updateDraft('lean_fit_score', e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Location</h2>
          <Field label="Region">
            <input className="field-input" value={draft.region || ''} onChange={e => updateDraft('region', e.target.value)} />
          </Field>
          <Field label="Country">
            <input className="field-input" value={draft.country || ''} onChange={e => updateDraft('country', e.target.value)} />
          </Field>
          <Field label="HQ city">
            <input className="field-input" value={draft.hq || ''} onChange={e => updateDraft('hq', e.target.value)} />
          </Field>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Links</h2>
          <Field label="Website">
            <input className="field-input" placeholder="https://…" value={draft.website_url || ''} onChange={e => updateDraft('website_url', e.target.value)} />
          </Field>
          <Field label="LinkedIn">
            <input className="field-input" placeholder="https://linkedin.com/company/…" value={draft.linkedin_company_url || ''} onChange={e => updateDraft('linkedin_company_url', e.target.value)} />
          </Field>
          <Field label="Careers page">
            <input className="field-input" placeholder="https://…" value={draft.careers_url || ''} onChange={e => updateDraft('careers_url', e.target.value)} />
          </Field>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Intelligence</h2>
          <Field label="Recommended functions">
            <input className="field-input" value={draft.recommended_functions || ''} onChange={e => updateDraft('recommended_functions', e.target.value)} />
          </Field>
          <Field label="Rationale / notes">
            <textarea
              className="field-input resize-none"
              rows={5}
              value={draft.rationale || ''}
              onChange={e => updateDraft('rationale', e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Delete modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Remove company?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Permanently deletes <strong>{draft.name}</strong>. Linked candidates will be detached.
                </p>
              </div>
              <button onClick={() => setPendingDelete(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            {deleteError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingDelete(false)} className="btn-secondary" disabled={deleting}>Cancel</button>
              <button onClick={deleteCompany} className="btn-danger" disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
