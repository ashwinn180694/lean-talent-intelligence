'use client';
import { useState } from 'react';
import { ExternalLink, Pencil, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function CompanyDetailClient({ company }: { company: Company }) {
  const [current, setCurrent] = useState(company);
  const [editing, setEditing] = useState(false);
  const [website, setWebsite] = useState(company.website_url || '');
  const [linkedin, setLinkedin] = useState(company.linkedin_company_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function saveLinks(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const updates = {
      website_url: normalizeUrl(website),
      linkedin_company_url: normalizeUrl(linkedin),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', current.id)
      .select('*')
      .single();
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCurrent(data as Company);
    setWebsite((data as Company).website_url || '');
    setLinkedin((data as Company).linkedin_company_url || '');
    setEditing(false);
    setMessage('Company links updated.');
  }

  return <div className="grid" style={{ gap: 18 }}>
    <div className="card company-hero">
      <div>
        <div className="muted">Company profile</div>
        <h1 className="h1">{current.name}</h1>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <span className={`pill ${(current.priority_tier || '').replace(' ', '').toLowerCase()}`}>{current.priority_tier || 'Unassigned'}</span>
          <span className="pill">Fit {current.lean_fit_score || '-'}</span>
          <span className="pill">{current.sub_sector || current.sector || 'Fintech'}</span>
        </div>
      </div>
      <button className="btn" onClick={() => setEditing(true)}><Pencil size={14}/> Edit links</button>
    </div>

    {message && <div className="success">{message}</div>}
    {error && <div className="error">{error}</div>}

    <div className="grid grid-3">
      <div className="card"><div className="muted">Region</div><strong>{current.region || '-'}</strong></div>
      <div className="card"><div className="muted">Country</div><strong>{current.country || '-'}</strong></div>
      <div className="card"><div className="muted">HQ</div><strong>{current.hq || '-'}</strong></div>
    </div>

    <div className="card">
      <h2>Links</h2>
      {!editing ? <div className="actions">
        <a className="btn secondary" href={current.website_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!current.website_url} onClick={e => { if (!current.website_url) e.preventDefault(); }}>Open Website <ExternalLink size={14}/></a>
        <a className="btn secondary" href={current.linkedin_company_url || undefined} target="_blank" rel="noreferrer" aria-disabled={!current.linkedin_company_url} onClick={e => { if (!current.linkedin_company_url) e.preventDefault(); }}>Open LinkedIn <ExternalLink size={14}/></a>
      </div> : <form className="grid" onSubmit={saveLinks}>
        <label>
          <div className="muted">Website URL</div>
          <input className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://company.com" />
        </label>
        <label>
          <div className="muted">LinkedIn company URL</div>
          <input className="input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/company/company-name" />
        </label>
        <div className="actions">
          <button className="btn" disabled={saving} type="submit"><Save size={14}/> {saving ? 'Saving...' : 'Save changes'}</button>
          <button className="btn secondary" type="button" onClick={() => { setEditing(false); setWebsite(current.website_url || ''); setLinkedin(current.linkedin_company_url || ''); }}><X size={14}/> Cancel</button>
        </div>
      </form>}
    </div>

    <div className="grid grid-3">
      <div className="card"><h2>Sector</h2><p>{current.sector || '-'}</p><p className="muted">{current.sub_sector || ''}</p></div>
      <div className="card"><h2>Recommended functions</h2><p>{current.recommended_functions || '-'}</p></div>
      <div className="card"><h2>Careers</h2>{current.careers_url ? <a className="btn secondary" href={current.careers_url} target="_blank" rel="noreferrer">Open Careers <ExternalLink size={14}/></a> : <p className="muted">No careers URL added yet.</p>}</div>
    </div>

    <div className="card">
      <h2>Why Lean targets this company</h2>
      <p className="muted">{current.rationale || 'No rationale added yet.'}</p>
    </div>
  </div>;
}
