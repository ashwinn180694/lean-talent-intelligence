'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Save, X, ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Candidate, Company, CompanyNote } from '@/lib/types';

const STATUSES = ['Mapped', 'Contacted', 'Replied', 'Interested', 'Interviewing', 'Offer', 'Hired', 'Rejected'];
const FUNCTIONS = ['Product', 'Engineering', 'Partnerships', 'Commercial', 'Operations', 'Compliance', 'Risk', 'Design', 'Data'];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function emptyCandidate(companyId: string, ownerEmail: string) {
  return {
    full_name: '',
    title: '',
    company_id: companyId,
    location: '',
    function_area: 'Product',
    seniority: 'Senior',
    linkedin_url: '',
    status: 'Mapped',
    owner_email: ownerEmail,
    notes: ''
  };
}

export default function CompanyDetailClient({ company, candidates, notes, userEmail }: { company: Company; candidates: Candidate[]; notes: CompanyNote[]; userEmail: string }) {
  const [current, setCurrent] = useState(company);
  const [companyCandidates, setCompanyCandidates] = useState<Candidate[]>(candidates || []);
  const [companyNotes, setCompanyNotes] = useState<CompanyNote[]>(notes || []);
  const [editing, setEditing] = useState(false);
  const [website, setWebsite] = useState(company.website_url || '');
  const [linkedin, setLinkedin] = useState(company.linkedin_company_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateForm, setCandidateForm] = useState(emptyCandidate(company.id, userEmail));
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const functionBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    companyCandidates.forEach(c => counts.set(c.function_area || 'Unassigned', (counts.get(c.function_area || 'Unassigned') || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [companyCandidates]);

  const statusCounts = useMemo(() => STATUSES.map(status => ({ status, count: companyCandidates.filter(c => c.status === status).length })), [companyCandidates]);

  async function logActivity(action: string, entityType: string, entityName: string) {
    await supabase.from('activity_feed').insert({ actor_email: userEmail || null, action, entity_type: entityType, entity_name: entityName });
  }

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
    logActivity('updated company links', 'company', current.name);
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!candidateForm.full_name.trim()) {
      setError('Candidate name is required.');
      return;
    }
    const payload = {
      ...candidateForm,
      full_name: candidateForm.full_name.trim(),
      title: candidateForm.title.trim() || null,
      location: candidateForm.location.trim() || null,
      linkedin_url: normalizeUrl(candidateForm.linkedin_url),
      notes: candidateForm.notes.trim() || null,
      owner_email: candidateForm.owner_email.trim() || userEmail || null
    };
    const { data, error } = await supabase.from('candidates').insert(payload).select('*').single();
    if (error) {
      setError(error.message);
      return;
    }
    const candidate = { ...(data as Candidate), company_name: current.name };
    setCompanyCandidates(prev => [candidate, ...prev]);
    setCandidateForm(emptyCandidate(current.id, userEmail));
    setShowCandidateForm(false);
    setMessage('Candidate added to this company.');
    logActivity('added candidate', 'candidate', candidate.full_name);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    setError('');
    const { data, error } = await supabase.from('company_notes').insert({ company_id: current.id, note: newNote.trim(), owner_email: userEmail || null }).select('*').single();
    setAddingNote(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCompanyNotes(prev => [data as CompanyNote, ...prev]);
    setNewNote('');
    logActivity('added company note', 'company', current.name);
  }

  return <div className="grid" style={{ gap: 18 }}>
    <div className="breadcrumb">
      <Link href="/dashboard">Home</Link><span>/</span><Link href="/companies">Companies</Link><span>/</span><strong>{current.name}</strong>
    </div>
    <Link href="/companies" className="back-link"><ArrowLeft size={16}/> Back to Companies</Link>
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
      <div className="actions">
        <button className="btn secondary" onClick={() => setShowCandidateForm(true)}><UserPlus size={14}/> Add Candidate</button>
        <button className="btn" onClick={() => setEditing(true)}><Pencil size={14}/> Edit links</button>
      </div>
    </div>

    {message && <div className="success">{message}</div>}
    {error && <div className="error">{error}</div>}

    <div className="grid grid-4">
      <div className="card"><div className="muted">Candidates</div><div className="stat">{companyCandidates.length}</div></div>
      <div className="card"><div className="muted">Contacted</div><div className="stat">{companyCandidates.filter(c => ['Contacted','Replied','Interested','Interviewing','Offer','Hired'].includes(c.status || '')).length}</div></div>
      <div className="card"><div className="muted">Interested+</div><div className="stat">{companyCandidates.filter(c => ['Interested','Interviewing','Offer','Hired'].includes(c.status || '')).length}</div></div>
      <div className="card"><div className="muted">Region</div><strong>{current.region || '-'}</strong><p className="muted">{current.country || current.hq || ''}</p></div>
    </div>

    <div className="card">
      <h2>Candidate coverage</h2>
      {functionBreakdown.length ? <div className="coverage-list">
        {functionBreakdown.map(([fn, count]) => <div key={fn} className="coverage-row"><span>{fn}</span><strong>{count}</strong></div>)}
      </div> : <p className="muted">No candidates mapped yet. Use Add Candidate to start building this company map.</p>}
      <div className="pipeline" style={{ marginTop: 16 }}>
        {statusCounts.map(({ status, count }) => <div key={status} className="pipeline-step"><span>{status}</span><strong>{count}</strong></div>)}
      </div>
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

    {showCandidateForm && <div className="card highlight-card">
      <div className="modal-header">
        <div><h2>Add candidate from {current.name}</h2><p className="muted">This candidate will automatically be linked to {current.name}.</p></div>
        <button className="icon-btn" type="button" onClick={() => setShowCandidateForm(false)} aria-label="Close"><X size={20}/></button>
      </div>
      <form className="grid form-grid" onSubmit={addCandidate}>
        <label>Full name<input className="input" value={candidateForm.full_name} onChange={e => setCandidateForm({ ...candidateForm, full_name: e.target.value })} required /></label>
        <label>Title<input className="input" value={candidateForm.title} onChange={e => setCandidateForm({ ...candidateForm, title: e.target.value })} /></label>
        <label>Location<input className="input" value={candidateForm.location} onChange={e => setCandidateForm({ ...candidateForm, location: e.target.value })} /></label>
        <label>Function<select className="select" value={candidateForm.function_area} onChange={e => setCandidateForm({ ...candidateForm, function_area: e.target.value })}>{FUNCTIONS.map(fn => <option key={fn}>{fn}</option>)}</select></label>
        <label>Seniority<input className="input" value={candidateForm.seniority} onChange={e => setCandidateForm({ ...candidateForm, seniority: e.target.value })} /></label>
        <label>Status<select className="select" value={candidateForm.status} onChange={e => setCandidateForm({ ...candidateForm, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
        <label>Owner<input className="input" value={candidateForm.owner_email} onChange={e => setCandidateForm({ ...candidateForm, owner_email: e.target.value })} /></label>
        <label>LinkedIn URL<input className="input" value={candidateForm.linkedin_url} onChange={e => setCandidateForm({ ...candidateForm, linkedin_url: e.target.value })} /></label>
        <label className="full-span">Notes<textarea value={candidateForm.notes} onChange={e => setCandidateForm({ ...candidateForm, notes: e.target.value })} /></label>
        <div className="actions full-span"><button className="btn" type="submit"><Plus size={14}/> Save Candidate</button><button className="btn secondary" type="button" onClick={() => setShowCandidateForm(false)}>Cancel</button></div>
      </form>
    </div>}

    <div className="grid grid-3">
      <div className="card"><h2>Sector</h2><p>{current.sector || '-'}</p><p className="muted">{current.sub_sector || ''}</p></div>
      <div className="card"><h2>Recommended functions</h2><p>{current.recommended_functions || '-'}</p></div>
      <div className="card"><h2>Careers</h2>{current.careers_url ? <a className="btn secondary" href={current.careers_url} target="_blank" rel="noreferrer">Open Careers <ExternalLink size={14}/></a> : <p className="muted">No careers URL added yet.</p>}</div>
    </div>

    <div className="card">
      <h2>Why Lean targets this company</h2>
      <p className="muted">{current.rationale || 'No rationale added yet.'}</p>
    </div>

    <div className="card">
      <h2>Company notes</h2>
      <form className="note-form" onSubmit={addNote}>
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add sourcing notes, team insights, hiring observations, compensation notes, or anything useful for future Talent Partners..." />
        <button className="btn" disabled={addingNote} type="submit">{addingNote ? 'Adding...' : 'Add note'}</button>
      </form>
      <div className="note-list">
        {companyNotes.length ? companyNotes.map(note => <div key={note.id} className="note-item"><p>{note.note}</p><div className="muted">{note.owner_email || 'Unknown'} · {new Date(note.created_at).toLocaleDateString()}</div></div>) : <p className="muted">No notes added yet.</p>}
      </div>
    </div>
  </div>;
}
