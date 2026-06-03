'use client';
import { useMemo, useState } from 'react';
import Papa from 'papaparse';
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

export default function CandidateClient({ initial, companies, userEmail }: { initial: any[]; companies: any[]; userEmail: string }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [form, setForm] = useState<CandidateForm>(emptyForm(userEmail));
  const owners = useMemo(() => Array.from(new Set(rows.map(r => r.owner_email).filter(Boolean))).sort(), [rows]);
  const filtered = useMemo(() => rows.filter(r => {
    const hay = `${r.full_name} ${r.title} ${r.company_name} ${r.function_area} ${r.owner_email}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (statusFilter === 'All' || r.status === statusFilter) && (ownerFilter === 'All' || r.owner_email === ownerFilter);
  }), [rows, q, statusFilter, ownerFilter]);

  async function logActivity(action: string, entityType: string, entityName: string) {
    await supabase.from('activity_feed').insert({ actor_email: userEmail || null, action, entity_type: entityType, entity_name: entityName });
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      title: form.title.trim() || null,
      location: form.location.trim() || null,
      linkedin_url: normalizeUrl(form.linkedin_url),
      owner_email: form.owner_email.trim() || userEmail || null,
      notes: form.notes.trim() || null
    };
    const { data, error } = await supabase.from('candidates').insert(payload).select('*').single();
    if (!error && data) {
      const company = companies.find(c => c.id === data.company_id);
      setRows([{ ...data, company_name: company?.name }, ...rows]);
      setForm(emptyForm(userEmail));
      logActivity('added candidate', 'candidate', data.full_name);
    } else alert(error?.message);
  }

  async function updateStatus(id: string, status: string, name: string) {
    const { error } = await supabase.from('candidates').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return alert(error.message);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    logActivity(`moved candidate to ${status}`, 'candidate', name);
  }

  async function importCsv(file: File) {
    Papa.parse(file, { header: true, complete: async (result) => {
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
          notes: r.Notes || r.notes || ''
        };
      });
      const { error } = await supabase.from('candidates').insert(payload).select('*');
      if (error) alert(error.message); else {
        logActivity(`imported ${payload.length} candidates`, 'candidate', 'CSV import');
        window.location.reload();
      }
    }});
  }
  return <>
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
      <select className="select" style={{ maxWidth: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      <select className="select" style={{ maxWidth: 220 }} value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}><option>All</option>{owners.map(o => <option key={o}>{o}</option>)}</select>
      <label className="btn secondary">Import CSV<input hidden type="file" accept=".csv" onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])}/></label>
      <a className="btn secondary" href="/data/candidate_import_template.csv">Template</a>
    </div>
    <div className="card"><table className="table"><thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Function</th><th>Owner</th><th>Status</th><th>LinkedIn</th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td>{c.full_name}</td><td>{c.title}</td><td>{c.company_name}</td><td>{c.function_area}</td><td>{c.owner_email || '-'}</td><td><select className="mini-select" value={c.status || 'Mapped'} onChange={e => updateStatus(c.id, e.target.value, c.full_name)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td><td>{c.linkedin_url ? <a href={c.linkedin_url} target="_blank">Open</a> : '-'}</td></tr>)}</tbody></table></div>
  </>;
}
