'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Pencil, Trash2, ExternalLink, Save, X, Users, Plus, Upload, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

const STATUSES = ['Mapped','Contacted','Replied','Interested','Interviewing','Offer','Hired','Rejected'];
const FUNCTIONS = ['Product','Engineering','Partnerships','Commercial','Operations','Compliance','Risk','Design','Data'];
const COMPANY_CATEGORIES = ['Payments','Remittance','Lending','Trading, Crypto & Investing','Payments Infrastructure','OpenBanking','KSA','UAE','Global Fintech','Big Tech'];
const COMPANY_REGIONS = ['KSA','UAE','MENA','Europe','North America','APAC','Africa','Global'];

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

function sanitizeText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uD800-\uDFFF]/g, ' ')
    .replace(/[ \u00A0]{2,}/g, ' ')
    .trim();
}

function sanitizeForSupabase(value: any): any {
  if (typeof value === 'string') return sanitizeText(value);
  if (Array.isArray(value)) return value.map(sanitizeForSupabase).filter(v => v !== '');
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeForSupabase(v)]));
  }
  return value;
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
  const [parsedCvData, setParsedCvData] = useState<any | null>(null);
  const [parsingCv, setParsingCv] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CandidateForm>(emptyForm(userEmail));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [drilldown, setDrilldown] = useState<{ title: string; rows: any[] } | null>(null);
  const [companyOptions, setCompanyOptions] = useState<any[]>(companies || []);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyCreator, setShowCompanyCreator] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', sub_sector: 'Global Fintech', region: 'Global', country: '', website_url: '', linkedin_company_url: '', lean_fit_score: 5, priority_tier: 'Tier 3' });

  useEffect(() => {
    setRows(initial || []);
    try {
      const serialized = JSON.stringify(initial || []);
      sessionStorage.setItem('lean_cache_candidates_v1', serialized);
      localStorage.setItem('lean_cache_candidates_v1', serialized);
    } catch {}
  }, [initial]);

  useEffect(() => {
    setCompanyOptions(companies || []);
  }, [companies]);

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
    const company = companyOptions.find(c => c.id === data.company_id);
    return { ...data, company_name: company?.name || data.company_name || null };
  }

  function parsedCompanyName(parsed: any) {
    return parsed?.experience?.find((exp: any) => exp.is_current && exp.company_name)?.company_name
      || parsed?.experience?.find((exp: any) => exp.company_name)?.company_name
      || '';
  }

  const filteredCompanyOptions = useMemo(() => {
    const needle = companySearch.trim().toLowerCase();
    const list = companyOptions || [];
    if (!needle) return list.slice(0, 80);
    return list.filter(c => `${c.name} ${c.sub_sector || ''} ${c.region || ''} ${c.country || ''}`.toLowerCase().includes(needle)).slice(0, 80);
  }, [companyOptions, companySearch]);

  const parsedCompanyMissing = useMemo(() => {
    const name = parsedCompanyName(parsedCvData);
    if (!name || form.company_id) return '';
    const exists = companyOptions.some(c => String(c.name).trim().toLowerCase() === String(name).trim().toLowerCase());
    return exists ? '' : name;
  }, [parsedCvData, form.company_id, companyOptions]);

  async function createCompanyAndSelect(target: 'add' | 'edit' = 'add', suggestedName?: string) {
    const name = sanitizeText((suggestedName || newCompany.name || '').trim());
    if (!name) return setError('Enter a company name first.');
    const existing = companyOptions.find(c => String(c.name).trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      if (target === 'edit') setEditForm(prev => ({ ...prev, company_id: existing.id })); else setForm(prev => ({ ...prev, company_id: existing.id }));
      setShowCompanyCreator(false);
      setCompanySearch(existing.name);
      setMessage(`${existing.name} already exists and has been selected.`);
      return;
    }
    setSavingCompany(true); setError(''); setMessage('');
    const payload = sanitizeForSupabase({
      name,
      sector: 'Fintech',
      sub_sector: newCompany.sub_sector || 'Global Fintech',
      region: newCompany.region || 'Global',
      country: newCompany.country || null,
      website_url: normalizeUrl(newCompany.website_url || ''),
      linkedin_company_url: normalizeUrl(newCompany.linkedin_company_url || ''),
      lean_fit_score: Number(newCompany.lean_fit_score || 5),
      priority_tier: newCompany.priority_tier || 'Tier 3',
      recommended_functions: 'Product, Engineering, Partnerships, Commercial',
      rationale: 'Added during candidate intake',
      updated_at: new Date().toISOString()
    });
    const { data, error } = await supabase.from('companies').insert(payload).select('*').single();
    setSavingCompany(false);
    if (error) return setError(error.message);
    setCompanyOptions(prev => [data, ...prev.filter(c => c.id !== data.id)]);
    if (target === 'edit') setEditForm(prev => ({ ...prev, company_id: data.id })); else setForm(prev => ({ ...prev, company_id: data.id }));
    setCompanySearch(data.name);
    setShowCompanyCreator(false);
    setNewCompany({ name: '', sub_sector: 'Global Fintech', region: 'Global', country: '', website_url: '', linkedin_company_url: '', lean_fit_score: 5, priority_tier: 'Tier 3' });
    setMessage(`${data.name} added and selected.`);
    await logActivity('added company during candidate intake', 'company', data.name);
  }


  function mergeParsedIntoBlankFields(current: CandidateForm, parsed: any): CandidateForm {
    const matchedCompany = parsed?.experience?.find((exp: any) => exp.is_current && exp.company_name)
      || parsed?.experience?.find((exp: any) => exp.company_name);
    const matchedCompanyRecord = matchedCompany?.company_name
      ? companyOptions.find(c => String(c.name).toLowerCase() === String(matchedCompany.company_name).toLowerCase())
      : null;
    return {
      ...current,
      full_name: current.full_name || parsed?.full_name || '',
      title: current.title || parsed?.title || matchedCompany?.title || '',
      company_id: current.company_id || matchedCompanyRecord?.id || '',
      location: current.location || parsed?.location || '',
      linkedin_url: current.linkedin_url || parsed?.linkedin_url || '',
      seniority: current.seniority || (parsed?.title && /head|director|vp|chief|lead|senior/i.test(parsed.title) ? 'Senior' : current.seniority),
      notes: current.notes || (parsed?.cv_summary ? `Auto-parsed from CV:\n${parsed.cv_summary}` : current.notes)
    };
  }

  async function parseCandidateCv(file: File) {
    setParsingCv(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await fetch('/api/parse-cv', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Could not parse CV.');
      setParsedCvData(json.parsed || null);
      setForm(prev => mergeParsedIntoBlankFields(prev, json.parsed));
      setMessage('CV parsed. Review the suggested fields before saving.');
    } catch (err: any) {
      setParsedCvData(null);
      setError(`CV attached, but automatic parsing failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setParsingCv(false);
    }
  }

  async function handleCandidateCvSelect(file: File | null) {
    setCvFile(file);
    setParsedCvData(null);
    if (file) await parseCandidateCv(file);
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
      previous_company: parsedCvData?.previous_company || null,
      skills: parsedCvData?.skills || [],
      tags: parsedCvData?.tags || [],
      languages: parsedCvData?.languages || [],
      education: parsedCvData?.education || [],
      cv_summary: parsedCvData?.cv_summary || null,
      parsed_cv_text: parsedCvData?.parsed_cv_text || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('candidates').insert(sanitizeForSupabase(payload)).select('*').single();
    if (!error && data) {
      try {
        if (cvFile) await attachCv(data.id, data.full_name, cvFile);
        if (parsedCvData?.experience?.length) {
          await supabase.from('candidate_experience').insert(sanitizeForSupabase(parsedCvData.experience.slice(0, 8).map((exp: any, index: number) => ({
            candidate_id: data.id,
            company_name: exp.company_name || 'Unknown company',
            title: exp.title || null,
            start_date: exp.start_date || null,
            end_date: exp.end_date || null,
            is_current: Boolean(exp.is_current),
            notes: exp.notes || 'Extracted from CV parser',
            sort_order: index
          }))));
        }
        setRows([enrichCandidate(data), ...rows]);
        setForm(emptyForm(userEmail));
        setCvFile(null);
        setParsedCvData(null);
        setShowAdd(false);
        setMessage(cvFile ? 'Candidate added and CV uploaded.' : 'Candidate added.');
        logActivity('added candidate', 'candidate', data.full_name);
      } catch (cvError: any) {
        setRows([enrichCandidate(data), ...rows]);
        setForm(emptyForm(userEmail));
        setCvFile(null);
        setParsedCvData(null);
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
    const { data, error } = await supabase.from('candidates').update(sanitizeForSupabase(payload)).eq('id', editingId).select('*').single();
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
        const company = companyOptions.find(c => c.name.toLowerCase() === companyName.toLowerCase());
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
      const { data, error } = await supabase.from('candidates').insert(sanitizeForSupabase(payload)).select('*');
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
        <button className="btn add-candidate-top" onClick={() => { setForm(emptyForm(userEmail)); setCvFile(null); setParsedCvData(null); setCompanySearch(''); setShowCompanyCreator(false); setShowAdd(true); }}><Plus size={16}/> Add Candidate</button>
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
          <select className="select" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}><option value="All">All companies</option>{companyOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
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
        <div className="modal-header"><div><h2>Add candidate</h2><p className="muted">Upload a CV, review parsed details, create a missing company, and save once everything looks right.</p></div><button className="icon-btn" onClick={() => { setShowAdd(false); setCvFile(null); setParsedCvData(null); setShowCompanyCreator(false); }} aria-label="Close"><X size={20}/></button></div>
        <form className="grid form-grid" onSubmit={addCandidate}>
          <label>Full name<input className="input" placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required /></label>
          <label>Title<input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <div className="candidate-company-picker full-span">
            <div className="field-label">Company</div>
            <div className="company-picker-shell">
              <input className="input" placeholder="Search company or type a new one..." value={companySearch} onChange={e => { setCompanySearch(e.target.value); setNewCompany(prev => ({ ...prev, name: e.target.value })); }} />
              <select className="select" value={form.company_id} onChange={e => { setForm({ ...form, company_id: e.target.value }); const selected = companyOptions.find(c => c.id === e.target.value); if (selected) setCompanySearch(selected.name); }}>
                <option value="">Select company</option>{filteredCompanyOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="company-picker-actions">
              <button className="btn secondary small" type="button" onClick={() => { setNewCompany(prev => ({ ...prev, name: companySearch || parsedCompanyMissing || prev.name })); setShowCompanyCreator(v => !v); }}><Plus size={13}/> {showCompanyCreator ? 'Hide new company form' : 'Add new company'}</button>
              {parsedCompanyMissing && <button className="btn ghost small" type="button" onClick={() => { setNewCompany(prev => ({ ...prev, name: parsedCompanyMissing })); setShowCompanyCreator(true); }}>Create parsed company: {parsedCompanyMissing}</button>}
            </div>
            {showCompanyCreator && <div className="inline-company-create">
              <div className="inline-company-create-head"><strong>Add company without leaving candidate intake</strong><span className="muted">It will be selected automatically.</span></div>
              <div className="inline-company-grid">
                <input className="input" placeholder="Company name" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} />
                <select className="select" value={newCompany.sub_sector} onChange={e => setNewCompany({ ...newCompany, sub_sector: e.target.value })}>{COMPANY_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                <select className="select" value={newCompany.region} onChange={e => setNewCompany({ ...newCompany, region: e.target.value })}>{COMPANY_REGIONS.map(r => <option key={r}>{r}</option>)}</select>
                <input className="input" placeholder="Country" value={newCompany.country} onChange={e => setNewCompany({ ...newCompany, country: e.target.value })} />
                <input className="input" placeholder="Website URL" value={newCompany.website_url} onChange={e => setNewCompany({ ...newCompany, website_url: e.target.value })} />
                <input className="input" placeholder="LinkedIn company URL" value={newCompany.linkedin_company_url} onChange={e => setNewCompany({ ...newCompany, linkedin_company_url: e.target.value })} />
              </div>
              <button className="btn small" type="button" disabled={savingCompany} onClick={() => createCompanyAndSelect('add')}>{savingCompany ? 'Adding...' : 'Add company & select'}</button>
            </div>}
          </div>
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
                  <p className="muted">{cvFile ? (parsingCv ? 'Parsing CV and preparing review suggestions...' : 'This CV will upload on save. Review parsed suggestions before saving.') : 'PDF, DOCX, or TXT. The platform will parse suggested details for review before save.'}</p>
                </div>
              </div>
              <div className="cv-upload-actions">
                <label className="btn secondary cv-upload-button" htmlFor="candidate-cv-upload"><Upload size={14}/> {cvFile ? 'Change CV' : 'Upload CV'}</label>
                <input id="candidate-cv-upload" className="sr-only-file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => handleCandidateCvSelect(e.target.files?.[0] || null)} />
                {cvFile && <button className="btn secondary small" type="button" onClick={() => { setCvFile(null); setParsedCvData(null); }}>Remove</button>}
              </div>
            </div>
            {cvFile && <div className="cv-selected-actions">
              <span className="success-pill">{parsingCv ? 'Parsing CV...' : parsedCvData ? 'CV parsed — review suggestions below, edit anything, then save.' : 'CV selected — click Save candidate & upload CV to finish.'}</span>
            </div>}
            {parsedCvData && <div className="cv-parse-preview cv-review-card">
              <div className="cv-review-head"><strong>Review parsed details before saving</strong><span className="review-pill">Manual approval</span></div>
              <div className="cv-review-grid">
                <div><span className="muted">Detected title</span><strong>{parsedCvData.title || form.title || 'Not detected'}</strong></div>
                <div><span className="muted">Detected company</span><strong>{parsedCompanyName(parsedCvData) || 'Not detected'}</strong></div>
                <div><span className="muted">Location</span><strong>{parsedCvData.location || form.location || 'Not detected'}</strong></div>
                <div><span className="muted">Skills</span><strong>{parsedCvData.skills?.slice?.(0, 5)?.join(', ') || 'Not detected'}</strong></div>
              </div>
              <p className="muted">Parsed information is used only when you click save. You can edit the fields above first.</p>
            </div>}
          </div>
          <label className="full-span">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="modal-actions full-span candidate-save-actions">
            <button className="btn" type="submit" disabled={savingCandidate || parsingCv}>{cvFile ? <Upload size={14}/> : <Save size={14}/>} {savingCandidate ? 'Saving...' : parsingCv ? 'Parsing CV...' : (cvFile ? 'Save candidate & upload CV' : 'Save candidate')}</button>
            <button className="btn secondary" type="button" onClick={() => { setShowAdd(false); setCvFile(null); setParsedCvData(null); setShowCompanyCreator(false); }}>Cancel</button>
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
          <label>Company<select className="select" value={editForm.company_id} onChange={e => setEditForm({ ...editForm, company_id: e.target.value })}><option value="">Company</option>{companyOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
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
