'use client';
import { useEffect, useMemo, useState } from 'react';
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

type Props = {
  company?: Company | null;
  companyId?: string;
  candidates?: Candidate[];
  notes?: CompanyNote[];
  userEmail?: string;
};

export default function CompanyDetailClient({ company = null, companyId, candidates = [], notes = [], userEmail = '' }: Props) {
  const initialId = company?.id || companyId || '';
  const [current, setCurrent] = useState<Company | null>(company);
  const [companyCandidates, setCompanyCandidates] = useState<Candidate[]>(candidates || []);
  const [companyNotes, setCompanyNotes] = useState<CompanyNote[]>(notes || []);
  const [resolvedUserEmail, setResolvedUserEmail] = useState(userEmail || '');
  const [editing, setEditing] = useState(false);
  const [website, setWebsite] = useState(company?.website_url || '');
  const [linkedin, setLinkedin] = useState(company?.linkedin_company_url || '');
  const [fitScore, setFitScore] = useState(company?.lean_fit_score ? String(company.lean_fit_score) : '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!company);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateForm, setCandidateForm] = useState(emptyCandidate(initialId, userEmail));
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    const id = company?.id || companyId;
    if (!id) return;
    let active = true;

    async function loadCompany() {
      setError('');
      try {
        const cached = sessionStorage.getItem(`lean_company_${id}`);
        if (!company && cached) {
          const parsed = JSON.parse(cached) as Company;
          if (active) {
            setCurrent(parsed);
            setWebsite(parsed.website_url || '');
            setLinkedin(parsed.linkedin_company_url || '');
            setFitScore(parsed.lean_fit_score ? String(parsed.lean_fit_score) : '');
            setLoading(false);
          }
        }
      } catch {}

      const { data: sessionData } = await supabase.auth.getSession();
      if (active && sessionData.session?.user?.email) {
        setResolvedUserEmail(sessionData.session.user.email);
        setCandidateForm(prev => ({ ...prev, owner_email: sessionData.session?.user?.email || prev.owner_email }));
      }

      const [{ data: freshCompany, error: companyError }, { data: freshCandidates }, { data: freshNotes }] = await Promise.all([
        supabase.from('companies').select('*').eq('id', id).single(),
        supabase.from('candidates_view').select('*').eq('company_id', id).order('created_at', { ascending: false }),
        supabase.from('company_notes').select('*').eq('company_id', id).order('created_at', { ascending: false })
      ]);

      if (!active) return;
      if (companyError) {
        setError(companyError.message);
        setLoading(false);
        return;
      }
      if (freshCompany) {
        const next = freshCompany as Company;
        setCurrent(next);
        setWebsite(next.website_url || '');
        setLinkedin(next.linkedin_company_url || '');
        setFitScore(next.lean_fit_score ? String(next.lean_fit_score) : '');
        try { sessionStorage.setItem(`lean_company_${id}`, JSON.stringify(next)); } catch {}
      }
      setCompanyCandidates((freshCandidates || []) as Candidate[]);
      setCompanyNotes((freshNotes || []) as CompanyNote[]);
      setLoading(false);
    }

    loadCompany();
    return () => { active = false; };
  }, [company?.id, companyId]);

  const functionBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    companyCandidates.forEach(c => counts.set(c.function_area || 'Unassigned', (counts.get(c.function_area || 'Unassigned') || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [companyCandidates]);

  const statusCounts = useMemo(() => STATUSES.map(status => ({ status, count: companyCandidates.filter(c => c.status === status).length })), [companyCandidates]);

  async function logActivity(action: string, entityType: string, entityName: string) {
    await supabase.from('activity_feed').insert({ actor_email: resolvedUserEmail || null, action, entity_type: entityType, entity_name: entityName });
  }

  async function saveCompanyDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return;
    const score = fitScore.trim() ? Number(fitScore) : null;
    if (score !== null && (Number.isNaN(score) || score < 1 || score > 10)) {
      setError('Fit score must be between 1 and 10.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    const updates = {
      website_url: normalizeUrl(website),
      linkedin_company_url: normalizeUrl(linkedin),
      lean_fit_score: score,
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
    const next = data as Company;
    setCurrent(next);
    setWebsite(next.website_url || '');
    setLinkedin(next.linkedin_company_url || '');
    setFitScore(next.lean_fit_score ? String(next.lean_fit_score) : '');
    try { sessionStorage.setItem(`lean_company_${next.id}`, JSON.stringify(next)); } catch {}
    setEditing(false);
    setMessage('Company details updated.');
    logActivity('updated company details', 'company', next.name);
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return;
    setError('');
    setMessage('');
    if (!candidateForm.full_name.trim()) {
      setError('Candidate name is required.');
      return;
    }
    const payload = {
      ...candidateForm,
      company_id: current.id,
      full_name: candidateForm.full_name.trim(),
      title: candidateForm.title.trim() || null,
      location: candidateForm.location.trim() || null,
      linkedin_url: normalizeUrl(candidateForm.linkedin_url),
      notes: candidateForm.notes.trim() || null,
      owner_email: candidateForm.owner_email.trim() || resolvedUserEmail || null
    };
    const { data, error } = await supabase.from('candidates').insert(payload).select('*').single();
    if (error) {
      setError(error.message);
      return;
    }
    const candidate = { ...(data as Candidate), company_name: current.name };
    setCompanyCandidates(prev => [candidate, ...prev]);
    setCandidateForm(emptyCandidate(current.id, resolvedUserEmail));
    setShowCandidateForm(false);
    setMessage('Candidate added to this company.');
    logActivity('added candidate', 'candidate', candidate.full_name);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !newNote.trim()) return;
    setAddingNote(true);
    setError('');
    const { data, error } = await supabase.from('company_notes').insert({ company_id: current.id, note: newNote.trim(), owner_email: resolvedUserEmail || null }).select('*').single();
    setAddingNote(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCompanyNotes(prev => [data as CompanyNote, ...prev]);
    setNewNote('');
    logActivity('added company note', 'company', current.name);
  }

  if (loading && !current) {
    return <div className="grid" style={{ gap: 18 }}>
      <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span><Link href="/companies">Companies</Link><span>/</span><strong>Loading...</strong></div>
      <div className="card skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>
      <div className="grid grid-4"><div className="card skeleton-card"></div><div className="card skeleton-card"></div><div className="card skeleton-card"></div><div className="card skeleton-card"></div></div>
    </div>;
  }

  if (!current) {
    return <div className="card"><h1>Company not found</h1><p className="muted">Return to Companies and try again.</p><Link href="/companies" className="btn secondary">Back to Companies</Link></div>;
  }

  return <div className="grid detail-page" style={{ gap: 18 }}>
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
        <button className="btn" onClick={() => setEditing(true)}><Pencil size={14}/> Edit company</button>
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
      <h2>Company details</h2>
      {!editing ? <div className="company-detail-grid">
        <div><div className="muted">Fit score</div><strong>{current.lean_fit_score || '-'}</strong></div>
        <div><div className="muted">Website</div>{current.website_url ? <a href={current.website_url} target="_blank" rel="noreferrer">Open Website <ExternalLink size={14}/></a> : <span className="muted">Missing</span>}</div>
        <div><div className="muted">LinkedIn</div>{current.linkedin_company_url ? <a href={current.linkedin_company_url} target="_blank" rel="noreferrer">Open LinkedIn <ExternalLink size={14}/></a> : <span className="muted">Missing</span>}</div>
      </div> : <form className="grid form-grid" onSubmit={saveCompanyDetails}>
        <label>
          <div className="muted">Fit score</div>
          <input className="input" type="number" min="1" max="10" value={fitScore} onChange={e => setFitScore(e.target.value)} placeholder="1-10" />
        </label>
        <label>
          <div className="muted">Website URL</div>
          <input className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://company.com" />
        </label>
        <label>
          <div className="muted">LinkedIn company URL</div>
          <input className="input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/company/company-name" />
        </label>
        <div className="actions full-span">
          <button className="btn" disabled={saving} type="submit"><Save size={14}/> {saving ? 'Saving...' : 'Save changes'}</button>
          <button className="btn secondary" type="button" onClick={() => { setEditing(false); setWebsite(current.website_url || ''); setLinkedin(current.linkedin_company_url || ''); setFitScore(current.lean_fit_score ? String(current.lean_fit_score) : ''); }}><X size={14}/> Cancel</button>
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
