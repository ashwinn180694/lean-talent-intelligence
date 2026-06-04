'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Pencil, Trash2, ExternalLink, Save, X } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CandidateForm>(emptyForm(userEmail));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage('');
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
      setRows([enrichCandidate(data), ...rows]);
      setForm(emptyForm(userEmail));
      setMessage('Candidate added.');
      logActivity('added candidate', 'candidate', data.full_name);
    } else setError(error?.message || 'Could not add candidate.');
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

  return <>
    <div className="grid grid-4">
      <div className="card"><div className="muted">Total candidates</div><div className="stat">{rows.length}</div></div>
      <div className="card"><div className="muted">Contacted+</div><div className="stat">{rows.filter(r => ['Contacted','Replied','Interested','Interviewing','Offer','Hired'].includes(r.status || '')).length}</div></div>
      <div className="card"><div className="muted">Interested+</div><div className="stat">{rows.filter(r => ['Interested','Interviewing','Offer','Hired'].includes(r.status || '')).length}</div></div>
      <div className="card"><div className="muted">Owners</div><div className="stat">{owners.length}</div></div>
    </div>

    <div className="card">
      <h2>Add candidate</h2>
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
        <label className="full-span">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
        <button className="btn">Save candidate</button>
      </form>
    </div>

    <div className="toolbar">
      <input className="input" style={{ maxWidth: 320 }} placeholder="Search candidates..." value={q} onChange={e => setQ(e.target.value)} />
      <select className="select" style={{ maxWidth: 210 }} value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}><option value="All">All companies</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select className="select" style={{ maxWidth: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      <select className="select" style={{ maxWidth: 220 }} value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}><option>All</option>{owners.map(o => <option key={o}>{o}</option>)}</select>
      <label className="btn secondary">Import CSV<input hidden type="file" accept=".csv" onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])}/></label>
      <a className="btn secondary" href="/data/candidate_import_template.csv">Template</a>
    </div>

    {message && <div className="success">{message}</div>}
    {error && <div className="error">{error}</div>}

    <div className="pipeline" style={{ marginBottom: 16 }}>{statusCounts.map(({ status, count }) => <div key={status} className="pipeline-step"><span>{status}</span><strong>{count}</strong></div>)}</div>

    <div className="card"><table className="table"><thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Function</th><th>Owner</th><th>Status</th><th>Links</th><th>Actions</th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><Link className="table-link" href={`/candidates/${c.id}`}>{c.full_name}</Link></td><td>{c.title}</td><td>{c.company_id ? <Link className="table-link" href={`/companies/${c.company_id}`}>{c.company_name}</Link> : '-'}</td><td>{c.function_area}</td><td>{c.owner_email || '-'}</td><td><select className="mini-select" value={c.status || 'Mapped'} onChange={e => updateStatus(c.id, e.target.value, c.full_name)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td><td>{c.linkedin_url ? <a href={c.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={12}/></a> : '-'}</td><td><div className="actions"><button className="icon-btn small" onClick={() => startEdit(c)} title="Edit"><Pencil size={15}/></button><button className="icon-btn small danger" onClick={() => deleteCandidate(c)} title="Delete"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>

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
  </>;
}
