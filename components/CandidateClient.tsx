'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Pencil, Trash2, ExternalLink, Save, X, Users, Plus, Upload, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

const STATUSES = ['Mapped','Contacted','Replied','Interested','Interviewing','Offer','Hired','Rejected'];
const FUNCTIONS = ['Product','Engineering','Partnerships','Commercial','Operations','Compliance','Risk','Design','Data'];

type CandidateForm = {
  full_name: string;
  title: string;
  company_id: string;
  location: string;
  function_area: string;
  seniority: string;
  linkedin_url: string;
  status: string;
  owner_email: string;
  notes: string;
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function emptyForm(userEmail: string): CandidateForm {
  return { full_name: '', title: '', company_id: '', location: '', function_area: 'Product', seniority: 'Senior', linkedin_url: '', status: 'Mapped', owner_email: userEmail, notes: '' };
}

function formFromCandidate(candidate: any): CandidateForm {
  return {
    full_name: candidate.full_name || '',
    title: candidate.title || '',
    company_id: candidate.company_id || '',
    location: candidate.location || '',
    function_area: candidate.function_area || 'Product',
    seniority: candidate.seniority || '',
    linkedin_url: candidate.linkedin_url || '',
    status: candidate.status || 'Mapped',
    owner_email: candidate.owner_email || '',
    notes: candidate.notes || ''
  };
}

export default function CandidateClient({ initial, companies, userEmail }: { initial: any[]; companies: any[]; userEmail: string }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [form, setForm] = useState<CandidateForm>(emptyForm(userEmail));
  const [showAdd, setShowAdd] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CandidateForm>(emptyForm(userEmail));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [drilldown, setDrilldown] = useState<{ title: string; rows: any[] } | null>(null);

  useEffect(() => {
    setRows(initial || []);
    try {
      const serialized = JSON.stringify(initial || []);
      sessionStorage.setItem('lean_cache_candidates_v1', serialized);
      localStorage.setItem('lean_cache_candidates_v1', serialized);
    } catch {}
  }, [initial]);

  const owners = useMemo(() => Array.from(new Set(rows.map(r => r.owner_email).filter(Boolean))).sort(), [rows]);
  const filtered = useMemo(() => rows.filter(r => {
    const hay = `${r.full_name} ${r.title} ${r.company_name} ${r.function_area} ${r.owner_email} ${r.status}`.toLowerCase();
    return hay.includes(q.toLowerCase())
      && (statusFilter === 'All' || r.status === statusFilter)
      && (ownerFilter === 'All' || r.owner_email === ownerFilter)
      && (companyFilter === 'All' || r.company_id === companyFilter);
  }), [rows, q, statusFilter, ownerFilter, companyFilter]);

  const statusCounts = useMemo(() => STATUSES.map(status => ({ status, count: rows.filter(r => r.status === status).length })), [rows]);

  async function logActivity(action: string, entityType: string, entityName: string) {
    await supabase.from('activity_feed').insert({ actor_email: userEmail || null, action, entity_type: entityType, entity_name: entityName });
  }

  function enrichCandidate(data: any) {
    const company = companies.find(c => c.id === data.company_id);
    return { ...data, company_name: company?.name || data.company_name || null };
  }

  async function attachCv(candidateId: string, candidateName: string, file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${candidateId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('candidate-cvs').upload(path, file, { upsert: false });
    if (uploadError) throw uploadError;
    const { data: signed } = await supabase.storage.from('candidate-cvs').createSignedUrl(path, 60 * 60 * 24 * 7);
    const { error: docError } = await supabase.from('candidate_documents').insert({
      candidate_id: candidateId,
      file_name: file.name,
      file_path: path,
      file_url: signed?.signedUrl || null,
      file_type: file.type || 'unknown',
      uploaded_by: userEmail || null
    });
    if (docError) throw docError;
    await supabase.from('candidate_timeline').insert({
      candidate_id: candidateId,
      actor_email: userEmail || null,
      event_type: 'cv',
      title: 'CV uploaded',
      description: file.name
    });
    await logActivity('uploaded candidate CV', 'candidate', candidateName);
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage(''); setSavingCandidate(true);
    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      title: form.title.trim() || null,
      company_id: form.company_id || null,
      location: form.location.trim() || null,
      function_area: form.function_area || null,
      seniority: form.seniority.trim() || null,
      linkedin_url: normalizeUrl(form.linkedin_url),
      owner_email: form.owner_email.trim() || userEmail || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('candidates').insert(payload).select('*').single();
    if (!error && data) {
      try {
        if (cvFile) await attachCv(data.id, data.full_name, cvFile);
        setRows([enrichCandidate(data), ...rows]);
        setForm(emptyForm(userEmail));
        setCvFile(null);
        setShowAdd(false);
        setMessage(cvFile ? 'Candidate added and CV uploaded.' : 'Candidate added.');
        logActivity('added candidate', 'candidate', data.full_name);
      } catch (cvError: any) {
        setRows([enrichCandidate(data), ...rows]);
        setForm(emptyForm(userEmail));
        setCvFile(null);
        setShowAdd(false);
        setError(`Candidate added, but CV upload failed: ${cvError?.message || 'Unknown error'}`);
      } finally {
        setSavingCandidate(false);
      }
    } else {
      setSavingCandidate(false);
      setError(error?.message || 'Could not add candidate.');
    }
  }

  function startEdit(candidate: any) {
    setEditingId(candidate.id);
    setEditForm(formFromCandidate(candidate));
    setError(''); setMessage('');
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(''); setMessage('');
    const payload = {
      full_name: editForm.full_name.trim(),
      title: editForm.title.trim() || null,
      company_id: editForm.company_id || null,
      location: editForm.location.trim() || null,
      function_area: editForm.function_area || null,
      seniority: editForm.seniority.trim() || null,
      linkedin_url: normalizeUrl(editForm.linkedin_url),
      status: editForm.status || 'Mapped',
      owner_email: editForm.owner_email.trim() || userEmail || null,
      notes: editForm.notes.trim() || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('candidates').update(payload).eq('id', editingId).select('*').single();
    if (error) return setError(error.message);
    const next = enrichCandidate(data);
    setRows(prev => prev.map(r => r.id === editingId ? next : r));
    setEditingId(null);
    setMessage('Candidate updated.');
    logActivity('updated candidate', 'candidate', next.full_name);
  }

  async function updateStatus(id: string, status: string, name: string) {
    const { error } = await supabase.from('candidates').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return setError(error.message);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    logActivity(`moved candidate to ${status}`, 'candidate', name);
  }

  async function deleteCandidate(candidate: any) {
    if (!confirm(`Delete ${candidate.full_name}? This cannot be undone.`)) return;
    setError(''); setMessage('');
    const { error } = await supabase.from('candidates').delete().eq('id', candidate.id);
    if (error) return setError(error.message);
    setRows(prev => prev.filter(r => r.id !== candidate.id));
    setMessage('Candidate deleted.');
    logActivity('deleted candidate', 'candidate', candidate.full_name);
  }

  async function importCsv(file: File) {
    Papa.parse(file, { header: true, skipEmptyLines: true, complete: async (result) => {
      setError(''); setMessage('');
      const payload = (result.data as any[]).filter(r => r.Name || r.full_name).map(r => {
        const companyName = r.Company || r.company || r.company_name || '';
        const company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
        return {
          full_name: r.Name || r.full_name,
          title: r.Title || r.title || '',
          company_id: company?.id || null,
          location: r.Location || r.location || '',
          function_area: r.Function || r.function_area || '',
          seniority: r.Seniority || r.seniority || '',
          linkedin_url: normalizeUrl(r.LinkedIn || r.linkedin_url || ''),
          status: r.Status || 'Mapped',
          owner_email: r.Owner || r.owner_email || userEmail,
          notes: r.Notes || r.notes || '',
          updated_at: new Date().toISOString()
        };
      });
      if (!payload.length) return setError('No candidates found in this CSV.');
      const { data, error } = await supabase.from('candidates').insert(payload).select('*');
      if (error) setError(error.message); else {
        logActivity(`imported ${payload.length} candidates`, 'candidate', 'CSV import');
        setRows(prev => [...(data || []).map(enrichCandidate), ...prev]);
        setMessage(`Imported ${payload.length} candidates.`);
      }
    }});
  }

  function openDrilldown(title: string, rows: any[]) {
    setDrilldown({ title, rows });
  }

  function candidateMiniCard(c: any) {
    return <div key={c.id} className="mini-record-card">
      <div>
        <Link className="table-link" href={`/candidates/${c.id}`}>{c.full_name}</Link>
        <div className="muted">{c.title || 'No title'} · {c.company_name || 'No company'}</div>
        <div className="muted">{c.function_area || 'Unassigned'} · Owner: {c.owner_email || 'Unassigned'} · Status: {c.status || 'Mapped'}</div>
      </div>
      <div className="actions">
        {c.linkedin_url && <a className="btn secondary" href={c.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={13}/></a>}
        <Link className="btn secondary" href={`/candidates/${c.id}`}>Open profile</Link>
      </div>
    </div>;
  }

  return <>
    <div className="candidate-page-shell">
      <div className="candidate-page-header card">
        <div>
          <p className="eyebrow">Talent CRM</p>
          <h2>Candidate database</h2>
          <p className="muted">Search, filter, update ownership, and move candidates through the sourcing pipeline.</p>
        </div>
        <button className="btn add-candidate-top" onClick={() => { setForm(emptyForm(userEmail)); setCvFile(null); setShowAdd(true); }}><Plus size={16}/> Add Candidate</button>
      </div>

      <div className="candidate-metrics-row">
        <button className="card metric-card" onClick={() => openDrilldown('All candidates', rows)}><div className="muted">Total candidates</div><div className="stat">{rows.length}</div><span className="metric-hint">Click to view</span></button>
        <button className="card metric-card" onClick={() => openDrilldown('Contacted+ candidates', rows.filter(r => ['Contacted','Replied','Interested','Interviewing','Offer','Hired'].includes(r.status || '')))}><div className="muted">Contacted+</div><div className="stat">{rows.filter(r => ['Contacted','Replied','Interested','Interviewing','Offer','Hired'].includes(r.status || '')).length}</div><span className="metric-hint">Click to view</span></button>
        <button className="card metric-card" onClick={() => openDrilldown('Interested+ candidates', rows.filter(r => ['Interested','Interviewing','Offer','Hired'].includes(r.status || '')))}><div className="muted">Interested+</div><div className="stat">{rows.filter(r => ['Interested','Interviewing','Offer','Hired'].includes(r.status || '')).length}</div><span className="metric-hint">Click to view</span></button>
        <button className="card metric-card" onClick={() => openDrilldown('Candidates grouped by owner', rows.filter(r => r.owner_email))}><div className="muted">Owners</div><div className="stat">{owners.length}</div><span className="metric-hint">Click to view</span></button>
      </div>

      <div className="card candidate-filter-card">
        <div className="candidate-filter-header">
          <div><strong>Filter candidates</strong><p className="muted">Narrow by company, status, owner, or keyword.</p></div>
          <div className="actions">
            <label className="btn secondary">Import CSV<input hidden type="file" accept=".csv" onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])}/></label>
            <a className="btn secondary" href="/data/candidate_import_template.csv">Template</a>
          </div>
        </div>
        <div className="candidate-filter-grid">
          <input className="input" placeholder="Search by name, title, company, owner..." value={q} onChange={e => setQ(e.target.value)} />
          <select className="select" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}><option value="All">All companies</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
          <select className="select" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}><option>All</option>{owners.map(o => <option key={o}>{o}</option>)}</select>
        </div>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="pipeline candidate-pipeline" style={{ marginBottom: 16 }}>{statusCounts.map(({ status, count }) => <button key={status} className="pipeline-step pipeline-button" onClick={() => openDrilldown(`${status} candidates`, rows.filter(r => r.status === status))}><span>{status}</span><strong>{count}</strong></button>)}</div>

      <div className="candidate-list-card card">
        <div className="candidate-list-header"><strong>{filtered.length} candidate{filtered.length === 1 ? '' : 's'}</strong><span className="muted">Click a name to open the full candidate intelligence profile.</span></div>
        <div className="candidate-card-list">
          {filtered.length ? filtered.map(c => <div className="candidate-list-item" key={c.id}>
            <div className="candidate-person-block">
              <Link className="candidate-name-link" href={`/candidates/${c.id}`}>{c.full_name}</Link>
              <div className="muted">{c.title || 'No title'} · {c.company_id ? <Link className="table-link" href={`/companies/${c.company_id}`}>{c.company_name}</Link> : 'No company'}</div>
              <div className="candidate-meta-row"><span>{c.function_area || 'Unassigned'}</span><span>{c.seniority || 'No seniority'}</span><span>Owner: {c.owner_email || 'Unassigned'}</span></div>
            </div>
            <div className="candidate-status-block">
              <select className="mini-select" value={c.status || 'Mapped'} onChange={e => updateStatus(c.id, e.target.value, c.full_name)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
              <div className="actions candidate-card-actions">
                {c.linkedin_url ? <a className="btn secondary" href={c.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={12}/></a> : null}
                <button className="icon-btn small" onClick={() => startEdit(c)} title="Edit"><Pencil size={15}/></button>
                <button className="icon-btn small danger" onClick={() => deleteCandidate(c)} title="Delete"><Trash2 size={15}/></button>
              </div>
            </div>
          </div>) : <div className="empty-state"><Users size={26}/><p>No candidates match this view yet.</p></div>}
        </div>
      </div>
    </div>

    {showAdd && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header"><div><h2>Add candidate</h2><p className="muted">Create a candidate without leaving this page.</p></div><button className="icon-btn" onClick={() => { setShowAdd(false); setCvFile(null); }} aria-label="Close"><X size={20}/></button></div>
        <form className="grid form-grid" onSubmit={addCandidate}>
          <label>Full name<input className="input" placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required /></label>
          <label>Title<input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label>Company<select className="select" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Location<input className="input" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
          <label>Function<select className="select" value={form.function_area} onChange={e => setForm({ ...form, function_area: e.target.value })}>{FUNCTIONS.map(fn => <option key={fn}>{fn}</option>)}</select></label>
          <label>Seniority<input className="input" placeholder="Seniority" value={form.seniority} onChange={e => setForm({ ...form, seniority: e.target.value })} /></label>
          <label>Owner<input className="input" placeholder="Owner" value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} /></label>
          <label>Status<select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="full-span">LinkedIn URL<input className="input" placeholder="LinkedIn URL" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></label>
          <div className="full-span cv-upload-field">
            <div className="field-label">CV / Resume</div>
            <div className={cvFile ? 'cv-upload-panel cv-upload-panel-ready' : 'cv-upload-panel'}>
              <div className="cv-upload-copy">
                <div className="cv-upload-icon"><FileText size={20}/></div>
                <div>
                  <strong>{cvFile ? cvFile.name : 'Upload CV while creating candidate'}</strong>
                  <p className="muted">{cvFile ? 'This CV will be uploaded to the candidate profile when you save.' : 'PDF, DOC, DOCX, or TXT. You can parse details later from the candidate profile.'}</p>
                </div>
              </div>
              <div className="cv-upload-actions">
                <label className="btn secondary cv-upload-button" htmlFor="candidate-cv-upload"><Upload size={14}/> {cvFile ? 'Change CV' : 'Upload CV'}</label>
                <input id="candidate-cv-upload" className="sr-only-file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                {cvFile && <button className="btn secondary small" type="button" onClick={() => setCvFile(null)}>Remove</button>}
              </div>
            </div>
            {cvFile && <div className="cv-selected-actions">
              <span className="success-pill">CV selected — click <strong>Save candidate & upload CV</strong> to finish.</span>
            </div>}
          </div>
          <label className="full-span">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="modal-actions full-span candidate-save-actions">
            <button className="btn" type="submit" disabled={savingCandidate}>{cvFile ? <Upload size={14}/> : <Save size={14}/>} {savingCandidate ? 'Saving...' : (cvFile ? 'Save candidate & upload CV' : 'Save candidate')}</button>
            <button className="btn secondary" type="button" onClick={() => { setShowAdd(false); setCvFile(null); }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>}

    {editingId && <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header"><div><h2>Edit candidate</h2><p className="muted">Update ownership, status, LinkedIn, notes, and company mapping.</p></div><button className="icon-btn" onClick={() => setEditingId(null)}><X size={20}/></button></div>
        <form className="grid form-grid" onSubmit={saveEdit}>
          <label>Full name<input className="input" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} required /></label>
          <label>Title<input className="input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></label>
          <label>Company<select className="select" value={editForm.company_id} onChange={e => setEditForm({ ...editForm, company_id: e.target.value })}><option value="">Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Location<input className="input" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} /></label>
          <label>Function<select className="select" value={editForm.function_area} onChange={e => setEditForm({ ...editForm, function_area: e.target.value })}>{FUNCTIONS.map(fn => <option key={fn}>{fn}</option>)}</select></label>
          <label>Seniority<input className="input" value={editForm.seniority} onChange={e => setEditForm({ ...editForm, seniority: e.target.value })} /></label>
          <label>Owner<input className="input" value={editForm.owner_email} onChange={e => setEditForm({ ...editForm, owner_email: e.target.value })} /></label>
          <label>Status<select className="select" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="full-span">LinkedIn URL<input className="input" value={editForm.linkedin_url} onChange={e => setEditForm({ ...editForm, linkedin_url: e.target.value })} /></label>
          <label className="full-span">Notes<textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} /></label>
          <div className="modal-actions full-span"><button className="btn" type="submit"><Save size={14}/> Save changes</button><button className="btn secondary" type="button" onClick={() => setEditingId(null)}>Cancel</button></div>
        </form>
      </div>
    </div>}
    {drilldown && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card drilldown-modal">
        <div className="modal-header">
          <div><h2>{drilldown.title}</h2><p className="muted">{drilldown.rows.length} record{drilldown.rows.length === 1 ? '' : 's'}</p></div>
          <button className="icon-btn" onClick={() => setDrilldown(null)} aria-label="Close"><X size={20}/></button>
        </div>
        <div className="drilldown-list">{drilldown.rows.length ? drilldown.rows.map(candidateMiniCard) : <div className="empty-state"><Users size={26}/><p>No candidates match this view yet.</p></div>}</div>
      </div>
    </div>}
  </>;
}
