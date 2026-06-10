'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Pencil, Save, Trash2, X, Upload, FileText, Briefcase, History, Sparkles, Plus, Download, RefreshCw, GraduationCap, Tags, Languages, CheckCircle2, CalendarDays, HeartHandshake } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

const STATUSES = ['Mapped','Contacted','Replied','Interested','Interviewing','Offer','Hired','Rejected'];
const FUNCTIONS = ['Product','Engineering','Partnerships','Commercial','Operations','Compliance','Risk','Design','Data'];
const SKILL_HINTS = ['Open Banking','Payments','API Products','Product Strategy','Partnerships','Banking','Fintech','Risk','Compliance','Data','Engineering Management','Platform','B2B SaaS','GTM','Enterprise Sales','KYC','AML','Lending','Cards','Core Banking','APIs','SaaS','Growth','Strategy','Product Management'];
const TAG_HINTS = ['Tier 1 Talent','High Potential','GCC Interested','Open Banking','Payments','Product Leader','Engineering Leader','Warm Relationship','Ashby Ready'];

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

function toArray(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
  return [];
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
    warmth_level: candidate?.warmth_level || 'Neutral',
    last_interaction_at: candidate?.last_interaction_at || '',
    next_follow_up_at: candidate?.next_follow_up_at || '',
    relationship_notes: candidate?.relationship_notes || '',
    cv_summary: candidate?.cv_summary || '',
    parsed_cv_text: candidate?.parsed_cv_text || '',
    notes: candidate?.notes || '',
    ashby_candidate_id: candidate?.ashby_candidate_id || ''
  };
}

function firstNonEmptyLine(text: string) {
  return text.split(/\n+/).map(l => l.trim()).find(Boolean) || '';
}

function parseCvText(text: string, companies: any[]) {
  const lower = text.toLowerCase();
  const skills = SKILL_HINTS.filter(skill => lower.includes(skill.toLowerCase()));
  const matchedCompanies = companies.filter(c => c?.name && lower.includes(String(c.name).toLowerCase())).slice(0, 8).map(c => c.name);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const linkedin = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[^\s)]+/i)?.[0] || '';
  const languageMatches = ['Arabic','English','Hindi','Urdu','French','Spanish','German'].filter(lang => lower.includes(lang.toLowerCase()));
  const educationLines = text.split(/\n+/).filter(line => /university|college|school|mba|bsc|msc|bachelor|master|degree/i.test(line)).slice(0, 4);
  const nameGuess = firstNonEmptyLine(text);
  const summary = [
    nameGuess ? `Profile headline: ${nameGuess}` : '',
    matchedCompanies.length ? `Companies mentioned: ${matchedCompanies.join(', ')}` : '',
    skills.length ? `Detected skills: ${skills.join(', ')}` : '',
    languageMatches.length ? `Languages mentioned: ${languageMatches.join(', ')}` : '',
    educationLines.length ? `Education signals: ${educationLines.join(' | ')}` : '',
    email ? `Email detected: ${email}` : ''
  ].filter(Boolean).join('\n');
  return { skills, matchedCompanies, linkedin, summary, languages: languageMatches, educationLines };
}

function normalizeParsedPreview(parsed: any, fallbackText = '') {
  if (!parsed) return null;
  return {
    ...parsed,
    parsed_cv_text: parsed.parsed_cv_text || fallbackText || '',
    cv_summary: parsed.cv_summary || parsed.summary || (fallbackText ? fallbackText.slice(0, 700) : ''),
    skills: parsed.skills || [],
    tags: parsed.tags || [],
    languages: parsed.languages || [],
    education: parsed.education || (parsed.educationLines || []).map((line: string, index: number) => ({ school: line, degree: '', field: '', start_year: '', end_year: '', notes: index === 0 ? 'Extracted from pasted CV text' : '' })),
    experience: parsed.experience || [],
    previous_company: parsed.previous_company || parsed.matchedCompanies?.[0] || ''
  };
}

function computeCompleteness(candidate: any, documents: any[], experience: any[], applications: any[]) {
  const checks = [
    Boolean(candidate?.full_name), Boolean(candidate?.title), Boolean(candidate?.company_id), Boolean(candidate?.linkedin_url),
    Boolean(candidate?.location), Boolean(candidate?.function_area), Boolean(candidate?.seniority), Boolean(candidate?.owner_email),
    Boolean(candidate?.status), Boolean(candidate?.cv_summary || candidate?.parsed_cv_text), documents.length > 0, experience.length > 0,
    toArray(candidate?.skills).length > 0, toArray(candidate?.tags).length > 0, Array.isArray(candidate?.education) && candidate.education.length > 0,
    applications.length > 0, Number(candidate?.relationship_score || 0) > 0
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const missing = [
    ['Title', candidate?.title], ['Company', candidate?.company_id], ['LinkedIn', candidate?.linkedin_url], ['Location', candidate?.location],
    ['Seniority', candidate?.seniority], ['CV summary', candidate?.cv_summary || candidate?.parsed_cv_text], ['CV document', documents.length],
    ['Career history', experience.length], ['Skills', toArray(candidate?.skills).length], ['Tags', toArray(candidate?.tags).length],
    ['Education', Array.isArray(candidate?.education) ? candidate.education.length : 0], ['Application history', applications.length], ['Relationship score', Number(candidate?.relationship_score || 0)]
  ].filter(([, value]) => !value).map(([label]) => label as string);
  return { score, missing };
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
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [cvText, setCvText] = useState('');
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [selectedCvParsed, setSelectedCvParsed] = useState<any | null>(null);
  const [fileParsing, setFileParsing] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [experienceForm, setExperienceForm] = useState<any>({ id: '', company_name: '', title: '', start_date: '', end_date: '', is_current: false, notes: '' });
  const [applicationForm, setApplicationForm] = useState<any>({ id: '', role_title: '', status: 'Mapped', source: 'Talent Intelligence', ashby_application_id: '', applied_at: '', notes: '' });
  const [educationForm, setEducationForm] = useState<any>({ school: '', degree: '', field: '', start_year: '', end_year: '', notes: '' });
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [ashbyJobs, setAshbyJobs] = useState<any[]>([]);
  const [ashbyJobId, setAshbyJobId] = useState('');
  const [ashbyLoading, setAshbyLoading] = useState(false);
  const [ashbyMessage, setAshbyMessage] = useState('');

  const skills = useMemo(() => toArray(candidate?.skills), [candidate]);
  const tags = useMemo(() => toArray(candidate?.tags), [candidate]);
  const languages = useMemo(() => toArray(candidate?.languages), [candidate]);
  const education = useMemo(() => Array.isArray(candidate?.education) ? candidate.education : [], [candidate]);
  const completeness = useMemo(() => computeCompleteness(candidate, documents, experience, applications), [candidate, documents, experience, applications]);

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
      await reloadCandidate();
      if (active) setLoading(false);
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

  async function updateCandidate(payload: any, timelineTitle: string, timelineDescription = '', timelineType = 'profile') {
    const { data, error } = await supabase.from('candidates').update(sanitizeForSupabase({ ...payload, updated_at: new Date().toISOString() })).eq('id', candidateId).select('*').single();
    if (error) { setError(error.message); return null; }
    const company = companies.find(c => c.id === data.company_id);
    const next = { ...data, company_name: company?.name || candidate?.company_name || null };
    setCandidate(next);
    setForm(toForm(next, userEmail));
    await addTimeline(timelineTitle, timelineDescription, timelineType);
    return next;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage('');
    const payload = {
      full_name: form.full_name.trim(), title: form.title.trim() || null, company_id: form.company_id || null,
      location: form.location.trim() || null, function_area: form.function_area || null, seniority: form.seniority.trim() || null,
      linkedin_url: normalizeUrl(form.linkedin_url || ''), status: form.status || 'Mapped', owner_email: form.owner_email.trim() || userEmail || null,
      previous_company: form.previous_company.trim() || null, relationship_score: Number(form.relationship_score || 0),
      warmth_level: form.warmth_level || 'Neutral',
      last_interaction_at: form.last_interaction_at || null,
      next_follow_up_at: form.next_follow_up_at || null,
      relationship_notes: form.relationship_notes?.trim() || null,
      cv_summary: form.cv_summary.trim() || null, parsed_cv_text: form.parsed_cv_text.trim() || null,
      ashby_candidate_id: form.ashby_candidate_id.trim() || null, notes: form.notes.trim() || null
    };
    const next = await updateCandidate(payload, 'Candidate profile updated', 'Core candidate details were edited.', 'profile');
    if (!next) return;
    setEditing(false);
    setMessage('Candidate updated.');
    logActivity('updated candidate profile', next.full_name);
  }

  async function updateStatus(status: string) {
    if (!candidate) return;
    const old = candidate.status || 'Mapped';
    const next = await updateCandidate({ status }, `Status changed to ${status}`, `Previous status: ${old}`, 'status');
    if (next) logActivity(`moved candidate to ${status}`, candidate.full_name);
  }

  async function saveRelationship(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      relationship_score: Number(form.relationship_score || 0),
      warmth_level: form.warmth_level || 'Neutral',
      last_interaction_at: form.last_interaction_at || null,
      next_follow_up_at: form.next_follow_up_at || null,
      relationship_notes: form.relationship_notes?.trim() || null
    };
    const next = await updateCandidate(payload, 'Relationship details updated', `Warmth: ${payload.warmth_level}. Next follow-up: ${payload.next_follow_up_at || 'not set'}.`, 'relationship');
    if (!next) return;
    setShowRelationshipModal(false);
    setMessage('Relationship details updated.');
    logActivity('updated candidate relationship details', next.full_name);
  }


  async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadAshbyJobs() {
    setAshbyLoading(true); setError(''); setAshbyMessage('');
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ashby/jobs', { headers });
    const json = await res.json();
    if (json.success) {
      setAshbyJobs(json.jobs || []);
      setAshbyMessage(`Loaded ${(json.jobs || []).length} open Ashby jobs.`);
    } else {
      setError(json.error || 'Unable to load Ashby jobs.');
    }
    setAshbyLoading(false);
  }

  async function pushCandidateToAshby() {
    if (!candidate) return;
    setAshbyLoading(true); setError(''); setAshbyMessage('');
    const headers = { ...(await getAuthHeaders()), 'content-type': 'application/json' };
    const res = await fetch('/api/ashby/push-candidate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        candidate: {
          id: candidate.id,
          full_name: candidate.full_name,
          linkedin_url: candidate.linkedin_url,
          location: candidate.location,
          notes: candidate.notes,
          cv_summary: candidate.cv_summary,
          ashby_candidate_id: candidate.ashby_candidate_id
        },
        jobId: ashbyJobId || null
      })
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error || `Ashby push failed${json.step ? ` at ${json.step}` : ''}.`);
      setAshbyLoading(false);
      return;
    }

    const candidatePayload: any = { ashby_candidate_id: json.ashbyCandidateId, ashby_last_synced_at: new Date().toISOString() };
    const { data, error } = await supabase.from('candidates').update(candidatePayload).eq('id', candidate.id).select('*').single();
    if (error) { setError(error.message); setAshbyLoading(false); return; }

    if (json.ashbyApplicationId && ashbyJobId) {
      const job = ashbyJobs.find(j => j.id === ashbyJobId);
      const appPayload = {
        candidate_id: candidate.id,
        role_title: job?.title || 'Ashby application',
        status: 'Synced to Ashby',
        source: 'Ashby',
        ashby_application_id: json.ashbyApplicationId,
        applied_at: new Date().toISOString().slice(0, 10),
        notes: `Created from Lean Talent Intelligence. Ashby job: ${job?.title || ashbyJobId}`
      };
      await supabase.from('candidate_applications').insert(appPayload);
    }

    await addTimeline('Pushed to Ashby', json.ashbyApplicationId ? `Candidate synced and application created: ${json.ashbyApplicationId}` : `Candidate synced: ${json.ashbyCandidateId}`, 'ashby');
    const company = companies.find(c => c.id === data.company_id);
    setCandidate({ ...data, company_name: company?.name || candidate.company_name || null });
    setForm(toForm({ ...data, company_name: company?.name || candidate.company_name || null }, userEmail));
    setAshbyMessage(json.ashbyApplicationId ? 'Candidate pushed to Ashby and application created.' : 'Candidate pushed to Ashby.');
    setAshbyLoading(false);
    reloadCandidate();
  }

  async function deleteCandidate() {
    if (!candidate || !confirm(`Delete ${candidate.full_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from('candidates').delete().eq('id', candidate.id);
    if (error) return setError(error.message);
    logActivity('deleted candidate', candidate.full_name);
    window.location.href = '/candidates';
  }


  async function parseCvFile(file: File) {
    setFileParsing(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await fetch('/api/parse-cv', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Could not parse CV.');
      const parsed = sanitizeForSupabase(normalizeParsedPreview(json.parsed || null, json.parsed?.parsed_cv_text || ''));
      setSelectedCvParsed(parsed);
      setCvText(parsed?.parsed_cv_text || '');
      setMessage('CV parsed. Review the suggestions below, then choose whether to save parsed details.');
      return json.parsed;
    } catch (err: any) {
      setSelectedCvParsed(null);
      setError(`CV selected, but automatic parsing failed: ${err?.message || 'Unknown error'}`);
      return null;
    } finally {
      setFileParsing(false);
    }
  }

  async function handleProfileCvSelect(file: File | null) {
    setSelectedCvFile(file);
    setSelectedCvParsed(null);
    if (file) await parseCvFile(file);
  }

  async function applyParsedCvToCandidate(parsed: any, fileName: string) {
    if (!parsed || !candidate) return;
    const mergedSkills = Array.from(new Set([...skills, ...(parsed.skills || [])]));
    const mergedTags = Array.from(new Set([...tags, ...(parsed.tags || [])]));
    const mergedLanguages = Array.from(new Set([...languages, ...(parsed.languages || [])]));
    const nextEducation = education.length ? education : (parsed.education || []);
    const currentExperienceCompanies = new Set(experience.map((exp: any) => String(exp.company_name || '').toLowerCase()));
    const newExperience = (parsed.experience || []).filter((exp: any) => exp.company_name && !currentExperienceCompanies.has(String(exp.company_name).toLowerCase())).slice(0, 8);
    const matchedCurrent = parsed.experience?.find?.((exp: any) => exp.is_current && exp.company_name);
    const matchedCompanyRecord = matchedCurrent?.company_name
      ? companies.find(c => String(c.name).toLowerCase() === String(matchedCurrent.company_name).toLowerCase())
      : null;
    const payload: any = {
      parsed_cv_text: parsed.parsed_cv_text || candidate.parsed_cv_text || null,
      cv_summary: parsed.cv_summary || candidate.cv_summary || null,
      skills: mergedSkills,
      tags: mergedTags,
      languages: mergedLanguages,
      education: nextEducation,
      previous_company: candidate.previous_company || parsed.previous_company || null
    };
    if (!candidate.title && (parsed.title || matchedCurrent?.title)) payload.title = parsed.title || matchedCurrent?.title;
    if (!candidate.linkedin_url && parsed.linkedin_url) payload.linkedin_url = parsed.linkedin_url;
    if (!candidate.location && parsed.location) payload.location = parsed.location;
    if (!candidate.company_id && matchedCompanyRecord?.id) payload.company_id = matchedCompanyRecord.id;
    const next = await updateCandidate(payload, 'CV parsed and profile fields updated', fileName, 'cv');
    if (next && newExperience.length) {
      const { data: expRows } = await supabase.from('candidate_experience').insert(newExperience.map((exp: any, index: number) => ({
        candidate_id: candidateId,
        company_name: exp.company_name || 'Unknown company',
        title: exp.title || null,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null,
        is_current: Boolean(exp.is_current),
        notes: exp.notes || 'Extracted from CV parser',
        sort_order: experience.length + index
      }))).select('*');
      if (expRows) setExperience(prev => [...expRows, ...prev]);
    }
  }

  async function uploadCv(file: File) {
    if (!file || !candidate) return;
    setFileUploading(true); setError(''); setMessage('');
    const parsed = selectedCvParsed || await parseCvFile(file);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${candidate.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('candidate-cvs').upload(path, file, { upsert: false });
    if (uploadError) { setFileUploading(false); return setError(uploadError.message); }
    const { data: signed } = await supabase.storage.from('candidate-cvs').createSignedUrl(path, 60 * 60 * 24 * 7);
    const { data, error } = await supabase.from('candidate_documents').insert({ candidate_id: candidate.id, file_name: file.name, file_path: path, file_url: signed?.signedUrl || null, file_type: file.type || 'unknown', uploaded_by: userEmail || null }).select('*').single();
    if (error) { setFileUploading(false); return setError(error.message); }
    setDocuments(prev => [data, ...prev]);
    setSelectedCvFile(null); setFileUploading(false); setMessage(parsed ? 'CV uploaded. Parsed suggestions are still available for review — click Save parsed details if they look correct.' : 'CV uploaded.');
    addTimeline('CV uploaded', file.name, 'cv');
    logActivity('uploaded candidate CV', candidate.full_name);
  }

  async function saveParsedCvDetails() {
    if (!selectedCvParsed) return setError('Parse or choose a CV first.');
    setError(''); setMessage('');
    await applyParsedCvToCandidate(selectedCvParsed, selectedCvFile?.name || 'CV text');
    setMessage('Parsed CV details saved to candidate profile.');
  }

  async function removeCv(doc: any) {
    if (!confirm(`Remove ${doc.file_name}? This deletes the CV file from storage and the candidate profile.`)) return;
    setError(''); setMessage('');
    if (doc.file_path) {
      const { error: storageError } = await supabase.storage.from('candidate-cvs').remove([doc.file_path]);
      if (storageError) return setError(storageError.message);
    }
    const { error } = await supabase.from('candidate_documents').delete().eq('id', doc.id);
    if (error) return setError(error.message);
    setDocuments(prev => prev.filter(item => item.id !== doc.id));
    setMessage('CV removed.');
    addTimeline('CV removed', doc.file_name, 'cv');
    if (candidate) logActivity('removed candidate CV', candidate.full_name);
  }

  async function applyCvParse() {
    if (!cvText.trim()) return setError('Paste CV text first, then run parser.');
    const parsed = normalizeParsedPreview(parseCvText(cvText, companies), cvText);
    setSelectedCvParsed(parsed);
    setMessage('CV text parsed. Review the suggestions, then click Save parsed details to update the candidate profile.');
  }

  async function addListValue(field: 'skills' | 'tags' | 'languages', value: string) {
    if (!candidate) return;
    const clean = value.trim();
    if (!clean) return;
    const current = toArray(candidate[field]);
    const nextValues = Array.from(new Set([...current, clean]));
    const next = await updateCandidate({ [field]: nextValues }, `${field.slice(0, -1)} added`, clean, field);
    if (next) {
      if (field === 'skills') setSkillInput('');
      if (field === 'tags') setTagInput('');
      if (field === 'languages') setLanguageInput('');
    }
  }

  async function removeListValue(field: 'skills' | 'tags' | 'languages', value: string) {
    if (!candidate) return;
    const nextValues = toArray(candidate[field]).filter(v => v !== value);
    await updateCandidate({ [field]: nextValues }, `${field.slice(0, -1)} removed`, value, field);
  }

  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const payload = { candidate_id: candidateId, company_name: experienceForm.company_name.trim(), title: experienceForm.title.trim() || null, start_date: experienceForm.start_date || null, end_date: experienceForm.end_date || null, is_current: Boolean(experienceForm.is_current), notes: experienceForm.notes.trim() || null };
    const query: any = experienceForm.id ? supabase.from('candidate_experience').update(payload).eq('id', experienceForm.id) : supabase.from('candidate_experience').insert(payload);
    const { error } = await query.select('*').single();
    if (error) return setError(error.message);
    setShowExperienceModal(false); setExperienceForm({ id: '', company_name: '', title: '', start_date: '', end_date: '', is_current: false, notes: '' });
    await addTimeline(experienceForm.id ? 'Career history updated' : 'Career history added', `${payload.title || 'Role'} · ${payload.company_name}`, 'experience');
    await reloadCandidate();
  }

  function editExperience(exp: any) {
    setExperienceForm({ id: exp.id, company_name: exp.company_name || '', title: exp.title || '', start_date: exp.start_date || '', end_date: exp.end_date || '', is_current: Boolean(exp.is_current), notes: exp.notes || '' });
    setShowExperienceModal(true);
  }

  async function deleteExperience(exp: any) {
    if (!confirm('Delete this career history item?')) return;
    const { error } = await supabase.from('candidate_experience').delete().eq('id', exp.id);
    if (error) return setError(error.message);
    setExperience(prev => prev.filter(item => item.id !== exp.id));
    addTimeline('Career history removed', `${exp.title || 'Role'} · ${exp.company_name}`, 'experience');
  }

  async function addApplication(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const payload = { candidate_id: candidateId, role_title: applicationForm.role_title.trim(), status: applicationForm.status || 'Mapped', source: applicationForm.source || 'Talent Intelligence', ashby_application_id: applicationForm.ashby_application_id || null, applied_at: applicationForm.applied_at || null, notes: applicationForm.notes.trim() || null };
    const query: any = applicationForm.id ? supabase.from('candidate_applications').update(payload).eq('id', applicationForm.id) : supabase.from('candidate_applications').insert(payload);
    const { error } = await query.select('*').single();
    if (error) return setError(error.message);
    setShowApplicationModal(false); setApplicationForm({ id: '', role_title: '', status: 'Mapped', source: 'Talent Intelligence', ashby_application_id: '', applied_at: '', notes: '' });
    await addTimeline(applicationForm.id ? 'Application updated' : 'Application added', `${payload.role_title} · ${payload.status}`, 'application');
    await reloadCandidate();
  }

  function editApplication(app: any) {
    setApplicationForm({ id: app.id, role_title: app.role_title || '', status: app.status || 'Mapped', source: app.source || 'Talent Intelligence', ashby_application_id: app.ashby_application_id || '', applied_at: app.applied_at || '', notes: app.notes || '' });
    setShowApplicationModal(true);
  }

  async function deleteApplication(app: any) {
    if (!confirm('Delete this application record?')) return;
    const { error } = await supabase.from('candidate_applications').delete().eq('id', app.id);
    if (error) return setError(error.message);
    setApplications(prev => prev.filter(item => item.id !== app.id));
    addTimeline('Application removed', `${app.role_title} · ${app.status}`, 'application');
  }

  async function saveEducation(e: React.FormEvent) {
    e.preventDefault();
    const nextEducation = [...education, educationForm].filter(item => item.school || item.degree || item.field);
    const next = await updateCandidate({ education: nextEducation }, 'Education added', `${educationForm.degree || 'Education'} · ${educationForm.school}`, 'education');
    if (!next) return;
    setEducationForm({ school: '', degree: '', field: '', start_year: '', end_year: '', notes: '' });
    setShowEducationModal(false);
  }

  async function removeEducation(index: number) {
    const item = education[index];
    const nextEducation = education.filter((_: any, idx: number) => idx !== index);
    await updateCandidate({ education: nextEducation }, 'Education removed', item?.school || 'Education entry', 'education');
  }

  if (loading) return <div className="card skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>;
  if (!candidate) return <div className="card"><h1>Candidate not found</h1><p className="muted">Return to Candidates and try again.</p><Link className="btn secondary" href="/candidates">Back to Candidates</Link></div>;

  return <div className="grid detail-page" style={{ gap: 18 }}>
    <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span><Link href="/candidates">Candidates</Link><span>/</span><strong>{candidate.full_name}</strong></div>
    <Link href="/candidates" className="back-link"><ArrowLeft size={16}/> Back to Candidates</Link>
    {message && <div className="success">{message}</div>}
    {error && <div className="error">{error}</div>}

    <div className="card company-hero candidate-hero-v81">
      <div>
        <div className="muted">Candidate intelligence profile</div>
        <h1 className="h1">{candidate.full_name}</h1>
        <p className="muted">{candidate.title || 'No title'} {candidate.company_name ? `· ${candidate.company_name}` : ''}</p>
        <div className="toolbar" style={{ marginBottom: 0 }}><span className="status-pill">{candidate.status || 'Mapped'}</span><span className="pill">{candidate.function_area || 'Unassigned'}</span><span className="pill">Owner: {candidate.owner_email || '-'}</span><span className="pill">Relationship: {candidate.relationship_score ?? 0}/10</span><span className="pill">{candidate.warmth_level || 'Neutral'}</span><span className="pill">Next: {candidate.next_follow_up_at || '-'}</span></div>
      </div>
      <div className="actions"><button className="btn" onClick={() => setEditing(true)}><Pencil size={14}/> Edit profile</button><button className="btn secondary" onClick={() => setShowRelationshipModal(true)}><HeartHandshake size={14}/> Relationship</button><button className="btn secondary" onClick={() => setShowCvModal(true)}><Upload size={14}/> Upload CV</button><button className="btn secondary danger-text" onClick={deleteCandidate}><Trash2 size={14}/> Delete</button></div>
    </div>

    <div className="grid grid-4">
      <div className="card"><div className="muted">Company</div>{candidate.company_id ? <Link className="table-link" href={`/companies/${candidate.company_id}`}>{candidate.company_name}</Link> : <strong>-</strong>}</div>
      <div className="card"><div className="muted">Relationship</div><strong>{candidate.relationship_score ?? 0}/10</strong><p className="muted">{candidate.warmth_level || 'Neutral'}</p></div>
      <div className="card"><div className="muted">Next follow-up</div><strong>{candidate.next_follow_up_at || '-'}</strong><p className="muted">Last: {candidate.last_interaction_at || '-'}</p></div>
      <div className="card"><div className="muted">Profile completeness</div><strong>{completeness.score}%</strong><div className="completeness-bar"><span style={{ width: `${completeness.score}%` }} /></div></div>
    </div>

    {completeness.missing.length > 0 && <div className="card compact-card"><strong>Missing intelligence</strong><p className="muted">Add: {completeness.missing.slice(0, 8).join(', ')}{completeness.missing.length > 8 ? '…' : ''}</p></div>}

    <details className="card intelligence-section" open>
      <summary><HeartHandshake size={18}/> Relationship & Follow-up</summary>
      <div className="section-body">
        <div className="company-detail-grid">
          <div><div className="muted">Relationship score</div><strong>{candidate.relationship_score ?? 0}/10</strong></div>
          <div><div className="muted">Warmth</div><strong>{candidate.warmth_level || 'Neutral'}</strong></div>
          <div><div className="muted">Last interaction</div><strong>{candidate.last_interaction_at || '-'}</strong></div>
          <div><div className="muted">Next follow-up</div><strong>{candidate.next_follow_up_at || '-'}</strong></div>
        </div>
        {candidate.relationship_notes ? <p className="preserve-lines">{candidate.relationship_notes}</p> : <p className="muted">No relationship notes yet. Add relationship context, follow-up timing, and warmth level.</p>}
        <button className="btn secondary" onClick={() => setShowRelationshipModal(true)}><CalendarDays size={14}/> Edit relationship</button>
      </div>
    </details>

    <div className="card">
      <h2>Status pipeline</h2>
      <div className="pipeline">{STATUSES.map(s => <button key={s} className={`pipeline-step pipeline-button ${candidate.status === s ? 'active' : ''}`} onClick={() => updateStatus(s)}><span>{s}</span><strong>{candidate.status === s ? '✓' : ''}</strong></button>)}</div>
    </div>

    <details className="card intelligence-section" open>
      <summary><RefreshCw size={18}/> Ashby</summary>
      <div className="section-body">
        <div className="company-detail-grid">
          <div><div className="muted">Ashby candidate ID</div><strong>{candidate.ashby_candidate_id || 'Not synced yet'}</strong></div>
          <div><div className="muted">Last synced</div><strong>{candidate.ashby_last_synced_at ? new Date(candidate.ashby_last_synced_at).toLocaleString() : '-'}</strong></div>
          <div><div className="muted">Selected job</div><strong>{ashbyJobs.find(j => j.id === ashbyJobId)?.title || 'Optional'}</strong></div>
        </div>
        <p className="muted">Push this candidate to Ashby from the server-side integration. Choose a job if you also want to create an Ashby application.</p>
        <div className="grid form-grid">
          <label className="full-span">Ashby job<select className="select" value={ashbyJobId} onChange={e => setAshbyJobId(e.target.value)}><option value="">No job selected — create candidate only</option>{ashbyJobs.map(job => <option key={job.id} value={job.id}>{job.title}{job.department ? ` · ${job.department}` : ''}{job.location ? ` · ${job.location}` : ''}</option>)}</select></label>
        </div>
        {ashbyMessage && <div className="success">{ashbyMessage}</div>}
        <div className="modal-actions">
          <button className="btn secondary" disabled={ashbyLoading} onClick={loadAshbyJobs} type="button">{ashbyLoading ? 'Loading…' : 'Load Ashby jobs'}</button>
          <button className="btn" disabled={ashbyLoading} onClick={pushCandidateToAshby} type="button">{ashbyLoading ? 'Syncing…' : candidate.ashby_candidate_id ? 'Update / create application in Ashby' : 'Push candidate to Ashby'}</button>
        </div>
      </div>
    </details>

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
        <div className="inline-add-row"><input className="input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add skill e.g. Open Banking" /><button className="btn secondary" onClick={() => addListValue('skills', skillInput)}><Plus size={14}/> Add skill</button></div>
        <div className="skill-strip">{skills.length ? skills.map(skill => <span className="pill removable-pill" key={skill}>{skill}<button onClick={() => removeListValue('skills', skill)}>×</button></span>) : <span className="muted">No skills captured yet.</span>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><Tags size={18}/> Tags & Languages</summary>
      <div className="section-body">
        <div className="grid form-grid">
          <div className="inline-add-row"><input className="input" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag e.g. High Potential" /><button className="btn secondary" onClick={() => addListValue('tags', tagInput)}><Plus size={14}/> Add tag</button></div>
          <div className="inline-add-row"><input className="input" value={languageInput} onChange={e => setLanguageInput(e.target.value)} placeholder="Add language e.g. Arabic" /><button className="btn secondary" onClick={() => addListValue('languages', languageInput)}><Plus size={14}/> Add language</button></div>
        </div>
        <div><strong>Suggested tags</strong><div className="skill-strip" style={{ marginTop: 8 }}>{TAG_HINTS.map(tag => <button key={tag} className="pill pill-button" onClick={() => addListValue('tags', tag)}>{tag}</button>)}</div></div>
        <div><strong>Tags</strong><div className="skill-strip" style={{ marginTop: 8 }}>{tags.length ? tags.map(tag => <span className="pill removable-pill" key={tag}>{tag}<button onClick={() => removeListValue('tags', tag)}>×</button></span>) : <span className="muted">No tags yet.</span>}</div></div>
        <div><strong>Languages</strong><div className="skill-strip" style={{ marginTop: 8 }}>{languages.length ? languages.map(lang => <span className="pill removable-pill" key={lang}>{lang}<button onClick={() => removeListValue('languages', lang)}>×</button></span>) : <span className="muted">No languages captured yet.</span>}</div></div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><FileText size={18}/> CV & Documents</summary>
      <div className="section-body">
        <div className="actions"><button className="btn" onClick={() => setShowCvModal(true)}><Upload size={14}/> Upload CV / Parse text</button></div>
        <div className="note-list">{documents.length ? documents.map(doc => <div className="note-item" key={doc.id}><strong>{doc.file_name}</strong><p className="muted">Uploaded by {doc.uploaded_by || '-'} · {new Date(doc.created_at).toLocaleString()}</p><div className="actions">{doc.file_url && <a className="btn secondary" href={doc.file_url} target="_blank" rel="noreferrer">Open CV <Download size={14}/></a>}<button className="btn secondary danger-text" type="button" onClick={() => removeCv(doc)}><Trash2 size={14}/> Remove CV</button></div></div>) : <div className="empty-state"><FileText size={24}/><p>No CV uploaded yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><Briefcase size={18}/> Career History</summary>
      <div className="section-body">
        <button className="btn secondary" onClick={() => { setExperienceForm({ id: '', company_name: '', title: '', start_date: '', end_date: '', is_current: false, notes: '' }); setShowExperienceModal(true); }}><Plus size={14}/> Add experience</button>
        <div className="timeline-list">{experience.length ? experience.map(exp => <div className="timeline-item" key={exp.id}><div className="timeline-action-row"><strong>{exp.title || 'Role'} · {exp.company_name}</strong><div className="actions"><button className="btn secondary tiny-btn" onClick={() => editExperience(exp)}>Edit</button><button className="btn secondary tiny-btn danger-text" onClick={() => deleteExperience(exp)}>Delete</button></div></div><p className="muted">{exp.start_date || '?'} – {exp.is_current ? 'Present' : exp.end_date || '?'}</p>{exp.notes && <p>{exp.notes}</p>}</div>) : <div className="empty-state"><Briefcase size={24}/><p>No career history captured yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><GraduationCap size={18}/> Education</summary>
      <div className="section-body">
        <button className="btn secondary" onClick={() => setShowEducationModal(true)}><Plus size={14}/> Add education</button>
        <div className="note-list">{education.length ? education.map((edu: any, index: number) => <div className="note-item" key={`${edu.school}-${index}`}><div className="timeline-action-row"><strong>{edu.degree || 'Education'} {edu.field ? `· ${edu.field}` : ''}</strong><button className="btn secondary tiny-btn danger-text" onClick={() => removeEducation(index)}>Delete</button></div><p className="muted">{edu.school || 'School'} {edu.start_year || edu.end_year ? `· ${edu.start_year || '?'} – ${edu.end_year || '?'}` : ''}</p>{edu.notes && <p>{edu.notes}</p>}</div>) : <div className="empty-state"><GraduationCap size={24}/><p>No education captured yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><History size={18}/> Previous Applications</summary>
      <div className="section-body">
        <button className="btn secondary" onClick={() => { setApplicationForm({ id: '', role_title: '', status: 'Mapped', source: 'Talent Intelligence', ashby_application_id: '', applied_at: '', notes: '' }); setShowApplicationModal(true); }}><Plus size={14}/> Add application</button>
        <div className="note-list">{applications.length ? applications.map(app => <div className="note-item" key={app.id}><div className="timeline-action-row"><strong>{app.role_title}</strong><div className="actions"><button className="btn secondary tiny-btn" onClick={() => editApplication(app)}>Edit</button><button className="btn secondary tiny-btn danger-text" onClick={() => deleteApplication(app)}>Delete</button></div></div><p className="muted">{app.status || 'Mapped'} · {app.source || 'Talent Intelligence'} {app.applied_at ? `· ${app.applied_at}` : ''}</p>{app.notes && <p>{app.notes}</p>}{app.ashby_application_id && <span className="pill">Ashby: {app.ashby_application_id}</span>}</div>) : <div className="empty-state"><History size={24}/><p>No previous applications yet.</p></div>}</div>
      </div>
    </details>

    <details className="card intelligence-section" open>
      <summary><RefreshCw size={18}/> Timeline</summary>
      <div className="section-body">
        <div className="timeline-list">{timeline.length ? timeline.map(item => <div className="timeline-item" key={item.id}><strong>{item.title}</strong><p className="muted">{new Date(item.created_at).toLocaleString()} · {item.actor_email || 'System'} · {item.event_type || 'update'}</p>{item.description && <p>{item.description}</p>}</div>) : <div className="empty-state"><History size={24}/><p>No timeline activity yet.</p></div>}</div>
      </div>
    </details>

    {editing && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><div className="modal-header"><div><h2>Edit candidate</h2><p className="muted">Update candidate details, owner, company mapping, relationship score, and intelligence summary.</p></div><button className="icon-btn" onClick={() => setEditing(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={save}>
      <label>Full name<input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required /></label><label>Title<input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label><label>Company<select className="select" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Previous company<input className="input" value={form.previous_company} onChange={e => setForm({ ...form, previous_company: e.target.value })} /></label><label>Location<input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label><label>Function<select className="select" value={form.function_area} onChange={e => setForm({ ...form, function_area: e.target.value })}>{FUNCTIONS.map(fn => <option key={fn}>{fn}</option>)}</select></label><label>Seniority<input className="input" value={form.seniority} onChange={e => setForm({ ...form, seniority: e.target.value })} /></label><label>Owner<input className="input" value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} /></label><label>Status<select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label><label>Relationship score<input className="input" type="number" min="0" max="10" value={form.relationship_score} onChange={e => setForm({ ...form, relationship_score: e.target.value })} /></label><label>Warmth<select className="select" value={form.warmth_level} onChange={e => setForm({ ...form, warmth_level: e.target.value })}><option>Cold</option><option>Neutral</option><option>Warm</option><option>Hot</option></select></label><label>Last interaction<input className="input" type="date" value={form.last_interaction_at} onChange={e => setForm({ ...form, last_interaction_at: e.target.value })} /></label><label>Next follow-up<input className="input" type="date" value={form.next_follow_up_at} onChange={e => setForm({ ...form, next_follow_up_at: e.target.value })} /></label><label className="full-span">LinkedIn URL<input className="input" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></label><label className="full-span">Ashby candidate ID<input className="input" value={form.ashby_candidate_id} onChange={e => setForm({ ...form, ashby_candidate_id: e.target.value })} placeholder="Optional for future Ashby sync" /></label><label className="full-span">CV / recruiter summary<textarea value={form.cv_summary} onChange={e => setForm({ ...form, cv_summary: e.target.value })} /></label><label className="full-span">Relationship notes<textarea value={form.relationship_notes} onChange={e => setForm({ ...form, relationship_notes: e.target.value })} /></label><label className="full-span">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label><div className="modal-actions full-span"><button className="btn" type="submit"><Save size={14}/> Save changes</button><button className="btn secondary" type="button" onClick={() => setEditing(false)}>Cancel</button></div>
    </form></div></div>}

    {showRelationshipModal && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><div className="modal-header"><div><h2>Relationship & follow-up</h2><p className="muted">Track candidate warmth, last interaction, and the next follow-up date. No outreach log is created.</p></div><button className="icon-btn" onClick={() => setShowRelationshipModal(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={saveRelationship}><label>Relationship score<input className="input" type="number" min="0" max="10" value={form.relationship_score} onChange={e => setForm({ ...form, relationship_score: e.target.value })} /></label><label>Warmth<select className="select" value={form.warmth_level} onChange={e => setForm({ ...form, warmth_level: e.target.value })}><option>Cold</option><option>Neutral</option><option>Warm</option><option>Hot</option></select></label><label>Last interaction<input className="input" type="date" value={form.last_interaction_at} onChange={e => setForm({ ...form, last_interaction_at: e.target.value })} /></label><label>Next follow-up<input className="input" type="date" value={form.next_follow_up_at} onChange={e => setForm({ ...form, next_follow_up_at: e.target.value })} /></label><label className="full-span">Relationship notes<textarea value={form.relationship_notes} onChange={e => setForm({ ...form, relationship_notes: e.target.value })} placeholder="Relationship context, preferences, relocation interest, compensation signals, or follow-up notes." /></label><div className="modal-actions full-span"><button className="btn" type="submit"><Save size={14}/> Save relationship</button><button className="btn secondary" type="button" onClick={() => setShowRelationshipModal(false)}>Cancel</button></div></form></div></div>}

    {showCvModal && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><div className="modal-header"><div><h2>Upload CV & review parsed details</h2><p className="muted">Attach a CV or paste CV text. Parsing creates suggestions only — nothing is saved to the profile until you click Save parsed details.</p></div><button className="icon-btn" onClick={() => { setShowCvModal(false); setSelectedCvFile(null); setSelectedCvParsed(null); }}><X size={20}/></button></div><div className="cv-upload-box"><div><strong>Candidate CV</strong><p className="muted">PDF, DOC, DOCX, or TXT. The file is saved privately in Supabase Storage. Parsed details remain in review mode until approved.</p></div><label className="btn secondary" style={{ cursor: 'pointer' }}><Upload size={14}/> Choose CV<input type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={e => handleProfileCvSelect(e.target.files?.[0] || null)} /></label></div>{selectedCvFile && <div className="success"><strong>CV attached:</strong> {selectedCvFile.name}<button className="inline-link" type="button" onClick={() => { setSelectedCvFile(null); setSelectedCvParsed(null); }}>Remove</button></div>}{fileParsing && <div className="success">Parsing CV and preparing review suggestions...</div>}{selectedCvParsed && <div className="cv-parse-preview"><strong>Review parsed suggestions before saving</strong><p className="muted">{[selectedCvParsed.title, selectedCvParsed.location, selectedCvParsed.skills?.slice?.(0, 5)?.join(', ')].filter(Boolean).join(' · ') || 'Parsed CV details captured.'}</p><div className="pill-row">{selectedCvParsed.previous_company && <span className="tag-pill">Previous: {selectedCvParsed.previous_company}</span>}{selectedCvParsed.languages?.slice?.(0,3)?.map((lang: string) => <span className="tag-pill" key={lang}>{lang}</span>)}</div></div>}{fileUploading && <div className="success">Uploading CV...</div>}<label>Paste CV text for parsing<textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder="Paste CV text here to extract summary, skills, LinkedIn URL, education signals, languages, and company mentions." /></label><div className="modal-actions"><button className="btn" disabled={!selectedCvFile || fileUploading || fileParsing} onClick={() => selectedCvFile && uploadCv(selectedCvFile)} type="button"><Upload size={14}/> {fileUploading ? 'Uploading...' : fileParsing ? 'Parsing...' : 'Upload CV only'}</button><button className="btn secondary" onClick={applyCvParse} type="button"><Sparkles size={14}/> Parse pasted text for review</button><button className="btn" disabled={!selectedCvParsed || fileUploading || fileParsing} onClick={saveParsedCvDetails} type="button"><Save size={14}/> Save parsed details</button><button className="btn secondary" onClick={() => { setShowCvModal(false); setSelectedCvFile(null); setSelectedCvParsed(null); }} type="button">Close</button></div></div></div>}

    {showExperienceModal && <div className="modal-backdrop"><div className="modal-card"><div className="modal-header"><div><h2>{experienceForm.id ? 'Edit' : 'Add'} experience</h2><p className="muted">Capture previous companies and role history.</p></div><button className="icon-btn" onClick={() => setShowExperienceModal(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={addExperience}><label>Company<input className="input" value={experienceForm.company_name} onChange={e => setExperienceForm({ ...experienceForm, company_name: e.target.value })} required /></label><label>Title<input className="input" value={experienceForm.title} onChange={e => setExperienceForm({ ...experienceForm, title: e.target.value })} /></label><label>Start<input className="input" placeholder="2021" value={experienceForm.start_date} onChange={e => setExperienceForm({ ...experienceForm, start_date: e.target.value })} /></label><label>End<input className="input" placeholder="2024 or Present" value={experienceForm.end_date} onChange={e => setExperienceForm({ ...experienceForm, end_date: e.target.value })} /></label><label className="full-span checkbox-row"><input type="checkbox" checked={experienceForm.is_current} onChange={e => setExperienceForm({ ...experienceForm, is_current: e.target.checked })}/> Current role</label><label className="full-span">Notes<textarea value={experienceForm.notes} onChange={e => setExperienceForm({ ...experienceForm, notes: e.target.value })} /></label><div className="modal-actions full-span"><button className="btn" type="submit">Save experience</button><button className="btn secondary" type="button" onClick={() => setShowExperienceModal(false)}>Cancel</button></div></form></div></div>}

    {showEducationModal && <div className="modal-backdrop"><div className="modal-card"><div className="modal-header"><div><h2>Add education</h2><p className="muted">Capture degrees, schools, and education notes.</p></div><button className="icon-btn" onClick={() => setShowEducationModal(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={saveEducation}><label>School<input className="input" value={educationForm.school} onChange={e => setEducationForm({ ...educationForm, school: e.target.value })} required /></label><label>Degree<input className="input" value={educationForm.degree} onChange={e => setEducationForm({ ...educationForm, degree: e.target.value })} /></label><label>Field<input className="input" value={educationForm.field} onChange={e => setEducationForm({ ...educationForm, field: e.target.value })} /></label><label>Start year<input className="input" value={educationForm.start_year} onChange={e => setEducationForm({ ...educationForm, start_year: e.target.value })} /></label><label>End year<input className="input" value={educationForm.end_year} onChange={e => setEducationForm({ ...educationForm, end_year: e.target.value })} /></label><label className="full-span">Notes<textarea value={educationForm.notes} onChange={e => setEducationForm({ ...educationForm, notes: e.target.value })} /></label><div className="modal-actions full-span"><button className="btn" type="submit">Save education</button><button className="btn secondary" type="button" onClick={() => setShowEducationModal(false)}>Cancel</button></div></form></div></div>}

    {showApplicationModal && <div className="modal-backdrop"><div className="modal-card"><div className="modal-header"><div><h2>{applicationForm.id ? 'Edit' : 'Add'} previous application</h2><p className="muted">Track Ashby-ready application history and outcomes.</p></div><button className="icon-btn" onClick={() => setShowApplicationModal(false)}><X size={20}/></button></div><form className="grid form-grid" onSubmit={addApplication}><label>Role title<input className="input" value={applicationForm.role_title} onChange={e => setApplicationForm({ ...applicationForm, role_title: e.target.value })} required /></label><label>Status<select className="select" value={applicationForm.status} onChange={e => setApplicationForm({ ...applicationForm, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label><label>Source<input className="input" value={applicationForm.source} onChange={e => setApplicationForm({ ...applicationForm, source: e.target.value })} /></label><label>Application date<input className="input" type="date" value={applicationForm.applied_at} onChange={e => setApplicationForm({ ...applicationForm, applied_at: e.target.value })} /></label><label className="full-span">Ashby application ID<input className="input" value={applicationForm.ashby_application_id} onChange={e => setApplicationForm({ ...applicationForm, ashby_application_id: e.target.value })} placeholder="Optional for future Ashby sync" /></label><label className="full-span">Notes<textarea value={applicationForm.notes} onChange={e => setApplicationForm({ ...applicationForm, notes: e.target.value })} /></label><div className="modal-actions full-span"><button className="btn" type="submit">Save application</button><button className="btn secondary" type="button" onClick={() => setShowApplicationModal(false)}>Cancel</button></div></form></div></div>}
  </div>;
}
