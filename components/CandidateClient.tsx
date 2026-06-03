'use client';
import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase-browser';

export default function CandidateClient({ initial, companies }: { initial: any[]; companies: any[] }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ full_name: '', title: '', company_id: '', location: '', function_area: 'Product', seniority: 'Senior', linkedin_url: '', status: 'Mapped' });
  const filtered = useMemo(() => rows.filter(r => `${r.full_name} ${r.title} ${r.company_name} ${r.function_area}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('candidates').insert(form).select('*').single();
    if (!error && data) {
      const company = companies.find(c => c.id === data.company_id);
      setRows([{ ...data, company_name: company?.name }, ...rows]);
      setForm({ full_name: '', title: '', company_id: '', location: '', function_area: 'Product', seniority: 'Senior', linkedin_url: '', status: 'Mapped' });
    } else alert(error?.message);
  }
  async function importCsv(file: File) {
    Papa.parse(file, { header: true, complete: async (result) => {
      const payload = (result.data as any[]).filter(r => r.Name || r.full_name).map(r => {
        const companyName = r.Company || r.company || r.company_name || '';
        const company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
        return { full_name: r.Name || r.full_name, title: r.Title || r.title || '', company_id: company?.id || null, location: r.Location || r.location || '', function_area: r.Function || r.function_area || '', seniority: r.Seniority || r.seniority || '', linkedin_url: r.LinkedIn || r.linkedin_url || '', status: r.Status || 'Mapped' };
      });
      const { data, error } = await supabase.from('candidates').insert(payload).select('*');
      if (error) alert(error.message); else window.location.reload();
    }});
  }
  return <>
    <div className="card">
      <h2>Add candidate</h2>
      <form className="grid form-grid" onSubmit={addCandidate}>
        <input className="input" placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
        <input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <select className="select" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input className="input" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        <input className="input" placeholder="Function" value={form.function_area} onChange={e => setForm({ ...form, function_area: e.target.value })} />
        <input className="input" placeholder="Seniority" value={form.seniority} onChange={e => setForm({ ...form, seniority: e.target.value })} />
        <input className="input" placeholder="LinkedIn URL" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} />
        <select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['Mapped','Contacted','Replied','Interested','Interviewing','Offer','Hired','Rejected'].map(s => <option key={s}>{s}</option>)}</select>
        <button className="btn">Save candidate</button>
      </form>
    </div>
    <div className="toolbar"><input className="input" style={{ maxWidth: 360 }} placeholder="Search candidates..." value={q} onChange={e => setQ(e.target.value)} /><label className="btn secondary">Import CSV<input hidden type="file" accept=".csv" onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])}/></label><a className="btn secondary" href="/data/candidate_import_template.csv">Template</a></div>
    <div className="card"><table className="table"><thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Function</th><th>Status</th><th>LinkedIn</th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td>{c.full_name}</td><td>{c.title}</td><td>{c.company_name}</td><td>{c.function_area}</td><td>{c.status}</td><td>{c.linkedin_url ? <a href={c.linkedin_url} target="_blank">Open</a> : '-'}</td></tr>)}</tbody></table></div>
  </>;
}
