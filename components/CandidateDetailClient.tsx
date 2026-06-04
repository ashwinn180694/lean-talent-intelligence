'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Pencil, Save, Trash2, X, Upload, FileText, Briefcase, History, Sparkles, Plus, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

const STATUSES = ['Mapped','Contacted','Replied','Interested','Interviewing','Offer','Hired','Rejected'];
const FUNCTIONS = ['Product','Engineering','Partnerships','Commercial','Operations','Compliance','Risk','Design','Data'];
const SKILL_HINTS = ['Open Banking','Payments','API Products','Product Strategy','Partnerships','Banking','Fintech','Risk','Compliance','Data','Engineering Management','Platform','B2B SaaS','GTM','Enterprise Sales','KYC','AML','Lending','Cards','Core Banking'];

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
    previous_company: candidate?.previous_company || '',
    relationship_score: candidate?.relationship_score ?? 0,
    cv_summary: candidate?.cv_summary || '',
    parsed_cv_text: candidate?.parsed_cv_text || '',
    notes: candidate?.notes || ''
  };
}

function firstNonEmptyLine(text: string) {
  return text.split(/\n+/).map(l => l.trim()).find(Boolean) || '';
}

function parseCvText(text: string, companies: any[]) {
  const lower = text.toLowerCase();
  const skills = SKILL_HINTS.filter(skill => lower.includes(skill.toLowerCase()));
  const matchedCompanies = companies.filter(c => c?.name && lower.includes(String(c.name).toLowerCase())).slice(0, 6).map(c => c.name);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const linkedin = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[^\s)]+/i)?.[0] || '';
  const nameGuess = firstNonEmptyLine(text);
  const summary = [
    nameGuess ? `Profile headline: ${nameGuess}` : '',
    matchedCompanies.length ? `Companies mentioned: ${matchedCompanies.join(', ')}` : '',
    skills.length ? `Detected skills: ${skills.join(', ')}` : '',
    email ? `Email detected: ${email}` : ''
  ].filter(Boolean).join('\n');
  return { skills, matchedCompanies, linkedin, summary };
}

export default function CandidateDetailClient({ candidateId }: { candidateId: string }) {
  const [candidate, setCandidate] = useState<any | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [cvText, setCvText] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [experienceForm, setExperienceForm] = useState<any>({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, notes: '' });
  const [applicationForm, setApplicationForm] = useState<any>({ role_title: '', status: 'Mapped', source: 'Talent Intelligence', applied_at: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const skills: string[] = useMemo(() => candidate?.skills || [], [candidate]);
  const languages: string[] = useMemo(() => candidate?.languages || [], [candidate]);

  async function reloadCandidate() {
    const [{ data: candidateData, error: candidateError }, { data: docRows }, { data: expRows }, { data: appRows }, { data: timelineRows }] = await Promise.all([
      supabase.from('candidates_view').select('*').eq('id', candidateId).single(),
      supabase.from('candidate_documents').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
      supabase.from('candidate_experience').select('*').eq('candidate_id', candidateId).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('candidate_applications').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
      supabase.from('candidate_timeline').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false })
    ]);
    if (candidateError) setError(candidateError.message);
    setCandidate(candidateData || null);
    setDocuments(docRows || []);
    setExperience(expRows || []);
    setApplications(appRows || []);
    setTimeline(timelineRows || []);
    setForm(toForm(candidateData, userEmail));
  }

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email || '';
      if (active) setUserEmail(email);
      const { data: companyData } = await supabase.from('companies').select('id,name').order('name');
      if (!active) return;
      setCompanies(companyData || []);
      const [{ data: candidateData, error: candidateError }, { data: docRows }, { data: expRows }, { data: appRows }, { data: timelineRows }] = await Promise.all([
        supabase.from('candidates_view').select('*').eq('id', candidateId).single(),
        supabase.from('candidate_documents').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
        supabase.from('candidate_experience').select('*').eq('candidate_id', candidateId).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('candidate_applications').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
        supabase.from('candidate_timeline').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false })
      ]);
      if (!active) return;
      if (candidateError) setError(candidateError.message);
      setCandidate(candidateData || null);
      setDocuments(docRows || []);
      setExperience(expRows || []);
      setApplications(appRows || []);
      setTimeline(timelineRows || []);
      setForm(toForm(candidateData, email));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [candidateId]);

  async function addTimeline(title: string, description = '', event_type = 'profile') {
    const { data } = await supabase.from('candidate_timeline').insert({ candidate_id: candidateId, actor_email: userEmail || null, event_type, title, description }).select('*').single();
    if (data) setTimeline(prev => [data, ...prev]);
  }

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
      previous_company: form.previous_company.trim() || null,
      relationship_score: Number(form.relationship_score || 0),
      cv_summary: form.cv_summary.trim() || null,
      parsed_cv_text: form.parsed_cv_text.trim() || null,
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
    addTimeline('Candidate profile updated', 'Core candidate details were edited.', 'profile');
    logActivity('updated candidate profile', next.full_name);
  }

  async function updateStatus(status: string) {
    if (!candidate) return;
    const { error } = await supabase.from('candidates').update({ status, updated_at: new Date().toISOString() }).eq('id', candidate.id);
    if (error) return setError(error.message);
    setCandidate({ ...candidate, status });
    setForm({ ...form, status });
    addTimeline(`Status changed to ${status}`, `Previous status: ${candidate.status || 'Mapped'}`, 'status');
    logActivity(`moved candidate to ${status}`, candidate.full_name);
  }

  async function deleteCandidate() {
    if (!candidate || !confirm(`Delete ${candidate.full_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from('candidates').delete().eq('id', candidate.id);
    if (error) return setError(error.message);
    logActivity('deleted candidate', candidate.full_name);
    window.location.href = '/candidates';
  }

  async function uploadCv(file: File) {
    if (!file || !candidate) return;
    setFileUploading(true); setError(''); setMessage('');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${candidateId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('candidate-cvs').upload(path, file, { upsert: false });
    if (uploadError) { setFileUploading(false); return setError(uploadError.message); }
    const { data: signed } = await supabase.storage.from('candidate-cvs').createSignedUrl(path, 60 * 60 * 24 * 7);
    const { data, error } = await supabase.from('candidate_documents').insert({ candidate_id: candidateId, file_name: file.name, file_path: path, file_url: signed?.signedUrl || null, file_type: file.type || 'unknown', uploaded_by: userEmail || null }).select('*').single();
    if (error) { setFileUploading(false); return setError(error.message); }
    setDocuments(prev => [data, ...prev]);
    await addTimeline('CV uploaded', file.name, 'cv');
    setMessage('CV uploaded. For PDF/DOCX parsing, paste CV text into the parser box below. Server-side parsing can be added when we connect Ashby/API services.');
    if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
      const text = await file.text();
      setCvText(text);
    }
    setFileUploading(false);
  }

  async function applyCvParse() {
    if (!cvText.trim()) return setError('Paste CV text first, then run parser.');
    const parsed = parseCvText(cvText, companies);
    const mergedSkills = Array.from(new Set([...(candidate?.skills || []), ...parsed.skills]));
    const previousCompany = parsed.matchedCompanies.find((name: string) => name !== candidate?.company_name) || candidate?.previous_company || '';
    const payload: any = { parsed_cv_text: cvText, cv_summary: parsed.summary || cvText.slice(0, 700), skills: mergedSkills, updated_at: new Date().toISOString() };
    if (parsed.linkedin && !candidate?.linkedin_url) payload.linkedin_url = parsed.linkedin;
    if (previousCompany) payload.previous_company = previousCompany;
    const { data, error } = await supabase.from('candidates').update(payload).eq('id', candidateId).select('*').single();
    if (error) return setError(error.message);
    setCandidate({ ...candidate, ...data });
    setForm(toForm({ ...candidate, ...data }, userEmail));
    await addTimeline('CV text parsed', `Detected ${mergedSkills.length} skills${previousCompany ? ` and previous company ${previousCompany}` : ''}.`, 'cv');
    setMessage('CV text parsed and candidate intelligence fields updated.');
  }

  async function addSkill(skill: string) {
    const clean = skill.trim();
    if (!clean || !candidate) return;
    const nextSkills = Array.from(new Set([...(candidate.skills || []), clean]));
    const { error } = await supabase.from('candidates').update({ skills: nextSkills, updated_at: new Date().toISOString() }).eq('id', candidateId);
    if (error) return setError(error.message);
    setCandidate({ ...candidate, skills: nextSkills });
    await addTimeline('Skill added', clean, 'skill');
  }

  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...experienceForm, candidate_id: candidateId, sort_order: experience.length };
    const { data, error } = await supabase.from('candidate_experience').insert(payload).select('*').single();
    if (error) return setError(error.message);
    setExperience(prev => [...prev, data]);
    setShowExperienceModal(false);
    setExperienceForm({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, notes: '' });
    await addTimeline('Experience added', `${data.title || 'Role'} at ${data.company_name}`, 'experience');
  }

  async function addApplication(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...applicationForm, candidate_id: candidateId, applied_at: applicationForm.applied_at || null };
    const { data, error } = await supabase.from('candidate_applications').insert(payload).select('*').single();
    if (error) return setError(error.message);
    setApplications(prev => [data, ...prev]);
    setShowApplicationModal(false);
    setApplicationForm({ role_title: '', status: 'Mapped', source: 'Talent Intelligence', applied_at: '', notes: '' });
    await addTimeline('Application added', `${data.role_title} · ${data.status}`, 'application');
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
        <div className="muted">Candidate intelligence profile</div>
        <h1 className="h1">{candidate.full_name}</h1>
        <p className="muted">{candidate.title || 'No title'} {candidate.company_name ? `· ${candidate.company_name}` : ''}</p>
        <div className="toolbar" style={{ marginBottom: 0 }}><span className="status-pill">{candidate.status || 'Mapped'}</span><span className="pill">{candidate.function_area || 'Unassigned'}</span><span className="pill">Owner: {candidate.owner_email || '-'}</span><span className="pill">Relationship: {candidate.relationship_score ?? 0}/10</span></div>
      </div>
      <div className="actions"><button className="btn" onClick={() => setEditing(true)}><Pencil size={14}/> Edit profile</button><button className="btn secondary" onClick={() => setShowCvModal(true)}><Upload size={14}/> Upload CV</button><button className="btn secondary danger-text" onClick={deleteCandidate}><Trash2 size={14}/> Delete</button></div>
    </div>

    <div className="grid grid-4">
      <div className="card"><div className="muted">Company</div>{candidate.company_id ? <Link className="table-link" href={`/companies/${candidate.company_id}`}>{candidate.company_name}</Link> : <strong>-</strong>}</div>
      <div className="card"><div className="muted">Previous company</div><strong>{candidate.previous_company || '-'}</strong></div>
      <div className="card"><div className="muted">Location</div><strong>{candidate.location || '-'}</strong></div>
      <div className="card"><div className="muted">Seniority</div><strong>{candidate.seniority || '-'}</strong></div>
    </div>

    <div className="card">
      <h2>Status pipeline</h2>
      <div className="pipeline">{STATUSES.map(s => <button key={s} className={`pipeline-step pipeline-button ${candidate.status === s ? 'active' : ''}`} onClick={() => updateStatus(s)}><span>{s}</span><strong>{candidate.status === s ? '✓' : ''}</strong></button>)}</div>
    </div>

    <details className="card intelligence-section" open>
      <summary><Sparkles size={18}/> Intelligence Summary</summary>
      <div className="section-body">
        <div className="company-detail-grid">
          <div><div className="muted">LinkedIn</div>{candidate.linkedin_url ? <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">Open LinkedIn <ExternalLink size={14}/></a> : <span className="muted">Missing</span>}</div>
          <div><div className="muted">Function</div><strong>{candidate.function_area || '-'}</strong></div>
          <div><div className="muted">Ashby candidate ID</div><strong>{candidate.ashby_candidate_id || 'Not synced yet'}</strong></div>
        </div>
        <h3>CV / Recruiter summary</h3>
        <p className="muted preserve-lines">{candidate.cv_summary || candidate.notes || 'No CV summary yet. Upload a CV or paste CV text to start building candidate intelligence.'}</p>
        <div className="skill-strip">{skills.length ? skills.map(skill => <span className="pill" key={skill}>{skill}</span>) : <span className="muted">No skills captured yet.</span>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><FileText size={18}/> CV & Documents</summary>
      <div className="section-body">
        <div className="actions"><button className="btn" onClick={() => setShowCvModal(true)}><Upload size={14}/> Upload CV / Parse text</button></div>
        <div className="note-list">{documents.length ? documents.map(doc => <div className="note-item" key={doc.id}><strong>{doc.file_name}</strong><p className="muted">Uploaded by {doc.uploaded_by || '-'} · {new Date(doc.created_at).toLocaleString()}</p>{doc.file_url && <a className="btn secondary" href={doc.file_url} target="_blank" rel="noreferrer">Open CV <Download size={14}/></a>}</div>) : <div className="empty-state"><FileText size={24}/><p>No CV uploaded yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><Briefcase size={18}/> Career History</summary>
      <div className="section-body">
        <button className="btn secondary" onClick={() => setShowExperienceModal(true)}><Plus size={14}/> Add experience</button>
        <div className="timeline-list">{experience.length ? experience.map(exp => <div className="timeline-item" key={exp.id}><strong>{exp.title || 'Role'} · {exp.company_name}</strong><p className="muted">{exp.start_date || '?'} – {exp.is_current ? 'Present' : exp.end_date || '?'}</p>{exp.notes && <p>{exp.notes}</p>}</div>) : <div className="empty-state"><Briefcase size={24}/><p>No career history captured yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><History size={18}/> Previous Applications</summary>
      <div className="section-body">
        <button className="btn secondary" onClick={() => setShowApplicationModal(true)}><Plus size={14}/> Add application</button>
        <div className="note-list">{applications.length ? applications.map(app => <div className="note-item" key={app.id}><strong>{app.role_title}</strong><p className="muted">{app.status || 'Mapped'} · {app.source || 'Talent Intelligence'} {app.applied_at ? `· ${app.applied_at}` : ''}</p>{app.notes && <p>{app.notes}</p>}{app.ashby_application_id && <span className="pill">Ashby: {app.ashby_application_id}</span>}</div>) : <div className="empty-state"><History size={24}/><p>No previous applications yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><RefreshCw size={18}/> Timeline</summary>
      <div className="section-body">
        <div className="timeline-list">{timeline.length ? timeline.map(item => <div className="timeline-item" key={item.id}><strong>{item.title}</strong><p className="muted">{new Date(item.created_at).toLocaleString()} · {item.actor_email || 'System'} · {item.event_type || 'update'}</p>{item.description && <p>{item.description}</p>}</div>) : <div className="empty-state"><History size={24}/><p>No timeline activity yet.</p></div>}</div>
      </div>
    </details>

    {editing && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header"><div><h2>Edit candidate</h2><p className="muted">Update candidate details, owner, company mapping, relationship score, and intelligence summary.</p></div><button className="icon-btn" onClick={() => setEditing(false)}><X size={20}/></button></div>
        <form className="grid form-grid" onSubmit={save}>
          <label>Full name<input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required /></label>
          <label>Title<input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label>Company<select className="select" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Previous company<input className="input" value={form.previous_company} onChange={e => setForm({ ...form, previous_company: e.target.value })} /></label>
          <label>Location<input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
          <label>Function<select className="select" value={form.function_area} onChange={e => setForm({ ...form, function_area: e.target.value })}>{FUNCTIONS.map(fn => <option key={fn}>{fn}</option>)}</select></label>
          <label>Seniority<input className="input" value={form.seniority} onChange={e => setForm({ ...form, seniority: e.target.value })} /></label>
          <label>Owner<input className="input" value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} /></label>
          <label>Status<select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Relationship score<input className="input" type="number" min="0" max="10" value={form.relationship_score} onChange={e => setForm({ ...form, relationship_score: e.target.value })} /></label>
          <label className="full-span">LinkedIn URL<input className="input" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></label>
          <label className="full-span">CV / recruiter summary<textarea value={form.cv_summary} onChange={e => setForm({ ...form, cv_summary: e.target.value })} /></label>
          <label className="full-span">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="modal-actions full-span"><button className="btn" type="submit"><Save size={14}/> Save changes</button><button className="btn secondary" type="button" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      </div>
    </div>}

    {showCvModal && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header"><div><h2>Upload CV & parse candidate details</h2><p className="muted">Upload CV files to Supabase. Paste CV text to extract skills and profile summary now; server-side PDF/DOCX parsing can be added with Ashby/API keys later.</p></div><button className="icon-btn" onClick={() => setShowCvModal(false)}><X size={20}/></button></div>
        <label>CV file<input className="input" type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => e.target.files?.[0] && uploadCv(e.target.files[0])} /></label>
        {fileUploading && <div className="success">Uploading CV...</div>}
        <label>Paste CV text for parsing<textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder="Paste CV text here to extract summary, skills, LinkedIn URL, and company mentions." /></label>
        <div className="modal-actions"><button className="btn" onClick={applyCvParse} type="button"><Sparkles size={14}/> Parse pasted CV text</button><button className="btn secondary" onClick={() => setShowCvModal(false)} type="button">Close</button></div>
      </div>
    </div>}

    {showExperienceModal && <div className="modal-backdrop"><div className="modal-card"><div className="modal-header"><div><h2>Add experience</h2><p className="muted">Capture previous companies and role history.</p></div><button className="icon-btn" onClick={() => setShowExperienceModal(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={addExperience}><label>Company<input className="input" value={experienceForm.company_name} onChange={e => setExperienceForm({ ...experienceForm, company_name: e.target.value })} required /></label><label>Title<input className="input" value={experienceForm.title} onChange={e => setExperienceForm({ ...experienceForm, title: e.target.value })} /></label><label>Start<input className="input" placeholder="2021" value={experienceForm.start_date} onChange={e => setExperienceForm({ ...experienceForm, start_date: e.target.value })} /></label><label>End<input className="input" placeholder="2024 or Present" value={experienceForm.end_date} onChange={e => setExperienceForm({ ...experienceForm, end_date: e.target.value })} /></label><label className="full-span checkbox-row"><input type="checkbox" checked={experienceForm.is_current} onChange={e => setExperienceForm({ ...experienceForm, is_current: e.target.checked })}/> Current role</label><label className="full-span">Notes<textarea value={experienceForm.notes} onChange={e => setExperienceForm({ ...experienceForm, notes: e.target.value })} /></label><div className="modal-actions full-span"><button className="btn" type="submit">Save experience</button><button className="btn secondary" type="button" onClick={() => setShowExperienceModal(false)}>Cancel</button></div></form></div></div>}

    {showApplicationModal && <div className="modal-backdrop"><div className="modal-card"><div className="modal-header"><div><h2>Add previous application</h2><p className="muted">Track Ashby-ready application history and outcomes.</p></div><button className="icon-btn" onClick={() => setShowApplicationModal(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={addApplication}><label>Role title<input className="input" value={applicationForm.role_title} onChange={e => setApplicationForm({ ...applicationForm, role_title: e.target.value })} required /></label><label>Status<select className="select" value={applicationForm.status} onChange={e => setApplicationForm({ ...applicationForm, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label><label>Source<input className="input" value={applicationForm.source} onChange={e => setApplicationForm({ ...applicationForm, source: e.target.value })} /></label><label>Application date<input className="input" type="date" value={applicationForm.applied_at} onChange={e => setApplicationForm({ ...applicationForm, applied_at: e.target.value })} /></label><label className="full-span">Notes<textarea value={applicationForm.notes} onChange={e => setApplicationForm({ ...applicationForm, notes: e.target.value })} /></label><div className="modal-actions full-span"><button className="btn" type="submit">Save application</button><button className="btn secondary" type="button" onClick={() => setShowApplicationModal(false)}>Cancel</button></div></form></div></div>}
  </div>;
}
