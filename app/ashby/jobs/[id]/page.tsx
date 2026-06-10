'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppShellStatic from '@/components/AppShellStatic';
import { supabase } from '@/lib/supabase-browser';
import { ArrowLeft, Briefcase, RefreshCw, Users, GitBranch, ExternalLink, Search, Mail, Linkedin, MapPin } from 'lucide-react';

function formatDate(value?: string | null) {
  if (!value) return '-';
  try { return new Date(value).toLocaleString(); } catch { return value; }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export default function AshbyJobDetailPage({ params }: { params: { id: string } }) {
  const jobId = decodeURIComponent(params.id);
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<Record<string, any>>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadJob() {
    setLoading(true);
    const [{ data: jobRow, error: jobError }, { data: appRows, error: appError }] = await Promise.all([
      supabase.from('ashby_jobs').select('*').eq('id', jobId).maybeSingle(),
      supabase.from('ashby_applications').select('*').eq('ashby_job_id', jobId).order('candidate_name')
    ]);

    if (jobError) setError(jobError.message);
    if (appError) setError(appError.message);
    setJob(jobRow || null);
    setApplications(appRows || []);

    const candidateIds = Array.from(new Set((appRows || []).map((app: any) => app.ashby_candidate_id).filter(Boolean)));
    if (candidateIds.length) {
      const { data: candidateRows } = await supabase.from('ashby_candidates').select('*').in('id', candidateIds);
      const map: Record<string, any> = {};
      (candidateRows || []).forEach((candidate: any) => { map[candidate.id] = candidate; });
      setCandidates(map);
    } else {
      setCandidates({});
    }
    setLoading(false);
  }

  useEffect(() => { loadJob(); }, [jobId]);

  const filteredApplications = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return applications;
    return applications.filter((app: any) => {
      const candidate = candidates[app.ashby_candidate_id] || {};
      return [app.candidate_name, app.status, app.stage, app.source, candidate.email, candidate.current_title, candidate.current_company, candidate.location]
        .join(' ').toLowerCase().includes(q);
    });
  }, [applications, candidates, query]);

  async function syncThisJob() {
    setSyncing(true); setMessage(''); setError('');
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ashby/job-applications', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const json = await res.json();
    if (json.success) {
      setMessage(`Synced ${json.applicationCount || 0} applications and ${json.candidateCount || 0} candidates for this job.`);
      await loadJob();
    } else {
      setError(json.error || 'Unable to sync this Ashby job.');
    }
    setSyncing(false);
  }

  return <AppShellStatic>
    <div className="ashby-job-shell">
      <div className="page-hero v11-page-hero ashby-job-hero">
        <div>
          <Link className="back-link" href="/ashby"><ArrowLeft size={14}/> Back to Ashby</Link>
          <p className="eyebrow">Ashby Job</p>
          <h1 className="h1">{job?.title || 'Ashby job'}</h1>
          <p className="muted">{[job?.department, job?.location, job?.status].filter(Boolean).join(' · ') || 'Job details synced from Ashby.'}</p>
        </div>
        <div className="modal-actions">
          {job?.ashby_url && <a className="btn secondary" href={job.ashby_url} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Open in Ashby</a>}
          <button className="btn" disabled={syncing} onClick={syncThisJob}><RefreshCw size={14}/> {syncing ? 'Syncing...' : 'Sync job candidates'}</button>
        </div>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="grid grid-4 ashby-metric-grid">
        <div className="card metric-card"><Users size={18}/><strong>{applications.length}</strong><span>Applications</span></div>
        <div className="card metric-card"><GitBranch size={18}/><strong>{new Set(applications.map((app: any) => app.stage || app.status || 'Unknown')).size}</strong><span>Stages</span></div>
        <div className="card metric-card"><Briefcase size={18}/><strong>{job?.status || '-'}</strong><span>Job status</span></div>
        <div className="card metric-card"><RefreshCw size={18}/><strong>{job?.synced_at ? formatDate(job.synced_at).split(',')[0] : '-'}</strong><span>Last job sync</span></div>
      </div>

      <div className="card ashby-search-card">
        <div className="search-row"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search candidates in this job by name, stage, email, company, title..." /></div>
      </div>

      <section className="card ashby-panel ashby-job-candidates-panel">
        <div className="section-header"><div><h2>Candidates in this Ashby job</h2><p className="muted">These candidates are synced from Ashby applications attached to this job.</p></div><span className="pill">{filteredApplications.length}</span></div>
        <div className="ashby-job-candidate-list">
          {loading ? <p className="muted">Loading...</p> : filteredApplications.length ? filteredApplications.map((app: any) => {
            const candidate = candidates[app.ashby_candidate_id] || {};
            return <div className="ashby-candidate-row" key={app.id}>
              <div className="candidate-avatar-soft">{String(app.candidate_name || candidate.full_name || 'C').slice(0, 2).toUpperCase()}</div>
              <div className="ashby-candidate-main">
                <strong>{app.candidate_name || candidate.full_name || 'Candidate'}</strong>
                <p className="muted">{[candidate.current_title, candidate.current_company, candidate.location].filter(Boolean).join(' · ') || 'Synced from Ashby application'}</p>
                <div className="ashby-candidate-links">
                  {candidate.email && <a href={`mailto:${candidate.email}`}><Mail size={13}/> {candidate.email}</a>}
                  {candidate.linkedin_url && <a href={candidate.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={13}/> LinkedIn</a>}
                  {candidate.location && <span><MapPin size={13}/> {candidate.location}</span>}
                </div>
              </div>
              <div className="ashby-candidate-stage">
                <span className="status-chip">{app.stage || app.status || 'Synced'}</span>
                <small>{app.applied_at ? formatDate(app.applied_at).split(',')[0] : ''}</small>
              </div>
            </div>;
          }) : <div className="empty-state"><Users size={24}/><p>No candidates synced for this job yet.</p><button className="btn" onClick={syncThisJob} disabled={syncing}>{syncing ? 'Syncing...' : 'Sync job candidates'}</button></div>}
        </div>
      </section>
    </div>
  </AppShellStatic>;
}
