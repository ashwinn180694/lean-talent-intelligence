'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Pencil, Save, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

const STATUSES = ['Mapped','Contacted','Replied','Interested','Interviewing','Offer','Hired','Rejected'];
const FUNCTIONS = ['Product','Engineering','Partnerships','Commercial','Operations','Compliance','Risk','Design','Data'];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function toForm(candidate: any, userEmail: string) {
  return {
    full_name: candidate?.full_name || '',
    title: candidate?.title || '',
    company_id: candidate?.company_id || '',
    location: candidate?.location || '',
    function_area: candidate?.function_area || 'Product',
    seniority: candidate?.seniority || '',
    linkedin_url: candidate?.linkedin_url || '',
    status: candidate?.status || 'Mapped',
    owner_email: candidate?.owner_email || userEmail || '',
    notes: candidate?.notes || ''
  };
}

export default function CandidateDetailClient({ candidateId }: { candidateId: string }) {
  const [candidate, setCandidate] = useState<any | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email || '';
      if (active) setUserEmail(email);
      const [{ data: candidateData, error: candidateError }, { data: companyData }] = await Promise.all([
        supabase.from('candidates_view').select('*').eq('id', candidateId).single(),
        supabase.from('companies').select('id,name').order('name')
      ]);
      if (!active) return;
      if (candidateError) setError(candidateError.message);
      setCandidate(candidateData || null);
      setCompanies(companyData || []);
      setForm(toForm(candidateData, email));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [candidateId]);

  async function logActivity(action: string, entityName: string) {
    await supabase.from('activity_feed').insert({ actor_email: userEmail || null, action, entity_type: 'candidate', entity_name: entityName });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage('');
    const payload = {
      full_name: form.full_name.trim(),
      title: form.title.trim() || null,
      company_id: form.company_id || null,
      location: form.location.trim() || null,
      function_area: form.function_area || null,
      seniority: form.seniority.trim() || null,
      linkedin_url: normalizeUrl(form.linkedin_url || ''),
      status: form.status || 'Mapped',
      owner_email: form.owner_email.trim() || userEmail || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('candidates').update(payload).eq('id', candidateId).select('*').single();
    if (error) return setError(error.message);
    const company = companies.find(c => c.id === data.company_id);
    const next = { ...data, company_name: company?.name || null };
    setCandidate(next);
    setForm(toForm(next, userEmail));
    setEditing(false);
    setMessage('Candidate updated.');
    logActivity('updated candidate profile', next.full_name);
  }

  async function updateStatus(status: string) {
    if (!candidate) return;
    const { error } = await supabase.from('candidates').update({ status, updated_at: new Date().toISOString() }).eq('id', candidate.id);
    if (error) return setError(error.message);
    setCandidate({ ...candidate, status });
    setForm({ ...form, status });
    logActivity(`moved candidate to ${status}`, candidate.full_name);
  }

  async function deleteCandidate() {
    if (!candidate || !confirm(`Delete ${candidate.full_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from('candidates').delete().eq('id', candidate.id);
    if (error) return setError(error.message);
    logActivity('deleted candidate', candidate.full_name);
    window.location.href = '/candidates';
  }

  if (loading) return <div className="card skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>;
  if (!candidate) return <div className="card"><h1>Candidate not found</h1><p className="muted">Return to Candidates and try again.</p><Link className="btn secondary" href="/candidates">Back to Candidates</Link></div>;

  return <div className="grid detail-page" style={{ gap: 18 }}>
    <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span><Link href="/candidates">Candidates</Link><span>/</span><strong>{candidate.full_name}</strong></div>
    <Link href="/candidates" className="back-link"><ArrowLeft size={16}/> Back to Candidates</Link>
    {message && <div className="success">{message}</div>}
    {error && <div className="error">{error}</div>}

    <div className="card company-hero">
      <div>
        <div className="muted">Candidate profile</div>
        <h1 className="h1">{candidate.full_name}</h1>
        <p className="muted">{candidate.title || 'No title'} {candidate.company_name ? `· ${candidate.company_name}` : ''}</p>
        <div className="toolbar" style={{ marginBottom: 0 }}><span className="status-pill">{candidate.status || 'Mapped'}</span><span className="pill">{candidate.function_area || 'Unassigned'}</span><span className="pill">Owner: {candidate.owner_email || '-'}</span></div>
      </div>
      <div className="actions"><button className="btn" onClick={() => setEditing(true)}><Pencil size={14}/> Edit candidate</button><button className="btn secondary danger-text" onClick={deleteCandidate}><Trash2 size={14}/> Delete</button></div>
    </div>

    <div className="grid grid-3">
      <div className="card"><div className="muted">Company</div>{candidate.company_id ? <Link className="table-link" href={`/companies/${candidate.company_id}`}>{candidate.company_name}</Link> : <strong>-</strong>}</div>
      <div className="card"><div className="muted">Location</div><strong>{candidate.location || '-'}</strong></div>
      <div className="card"><div className="muted">Seniority</div><strong>{candidate.seniority || '-'}</strong></div>
    </div>

    <div className="card">
      <h2>Status pipeline</h2>
      <div className="pipeline">{STATUSES.map(s => <button key={s} className={`pipeline-step pipeline-button ${candidate.status === s ? 'active' : ''}`} onClick={() => updateStatus(s)}><span>{s}</span><strong>{candidate.status === s ? '✓' : ''}</strong></button>)}</div>
    </div>

    {!editing ? <div className="card">
      <h2>Details</h2>
      <div className="company-detail-grid">
        <div><div className="muted">LinkedIn</div>{candidate.linkedin_url ? <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">Open LinkedIn <ExternalLink size={14}/></a> : <span className="muted">Missing</span>}</div>
        <div><div className="muted">Function</div><strong>{candidate.function_area || '-'}</strong></div>
        <div><div className="muted">Owner</div><strong>{candidate.owner_email || '-'}</strong></div>
      </div>
      <h3>Notes</h3><p className="muted">{candidate.notes || 'No notes added yet.'}</p>
    </div> : <div className="card highlight-card">
      <div className="modal-header"><div><h2>Edit candidate</h2><p className="muted">Update candidate details, owner, company mapping, and notes.</p></div><button className="icon-btn" onClick={() => setEditing(false)}><X size={20}/></button></div>
      <form className="grid form-grid" onSubmit={save}>
        <label>Full name<input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required /></label>
        <label>Title<input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
        <label>Company<select className="select" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Location<input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
        <label>Function<select className="select" value={form.function_area} onChange={e => setForm({ ...form, function_area: e.target.value })}>{FUNCTIONS.map(fn => <option key={fn}>{fn}</option>)}</select></label>
        <label>Seniority<input className="input" value={form.seniority} onChange={e => setForm({ ...form, seniority: e.target.value })} /></label>
        <label>Owner<input className="input" value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} /></label>
        <label>Status<select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
        <label className="full-span">LinkedIn URL<input className="input" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></label>
        <label className="full-span">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
        <div className="actions full-span"><button className="btn" type="submit"><Save size={14}/> Save changes</button><button className="btn secondary" type="button" onClick={() => setEditing(false)}>Cancel</button></div>
      </form>
    </div>}
  </div>;
}
