'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShellStatic from '@/components/AppShellStatic';
import { supabase } from '@/lib/supabase-browser';
import { Briefcase, RefreshCw, Users, GitBranch, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';

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

export default function AshbyWorkspacePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [syncRuns, setSyncRuns] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<'jobs' | 'candidates' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const lastSync = syncRuns[0];
  const filteredJobs = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return jobs;
    return jobs.filter(job => [job.title, job.department, job.location, job.status].join(' ').toLowerCase().includes(q));
  }, [jobs, query]);

  const filteredApplications = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return applications;
    return applications.filter(app => [app.candidate_name, app.job_title, app.status, app.stage].join(' ').toLowerCase().includes(q));
  }, [applications, query]);

  async function loadLocalData() {
    setLoading(true);
    const [jobRows, candidateRows, appRows, runs] = await Promise.all([
      supabase.from('ashby_jobs').select('*').order('title'),
      supabase.from('ashby_candidates').select('*').order('synced_at', { ascending: false }).limit(200),
      supabase.from('ashby_applications').select('*').order('synced_at', { ascending: false }).limit(300),
      supabase.from('ashby_sync_runs').select('*').order('finished_at', { ascending: false }).limit(10)
    ]);
    if (jobRows.error) setError(jobRows.error.message);
    setJobs(jobRows.data || []);
    setCandidates(candidateRows.data || []);
    setApplications(appRows.data || []);
    setSyncRuns(runs.data || []);
    setLoading(false);
  }

  useEffect(() => { loadLocalData(); }, []);

  async function syncJobs() {
    setSyncing('jobs'); setError(''); setMessage('');
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ashby/jobs', { method: 'POST', headers });
    const json = await res.json();
    if (json.success) {
      setMessage(`Synced ${json.count || 0} Ashby jobs.`);
      await loadLocalData();
    } else {
      setError(json.error || 'Unable to sync Ashby jobs.');
    }
    setSyncing(null);
  }

  async function syncCandidates() {
    setSyncing('candidates'); setError(''); setMessage('');
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ashby/sync-candidates', { method: 'POST', headers });
    const json = await res.json();
    if (json.success) {
      setMessage(`Scanned ${json.jobsScanned || 0} live jobs. Synced ${json.candidateCount || 0} job-linked candidates and ${json.applicationCount || 0} applications. Created ${json.localCandidatesCreated || 0} local candidate records.`);
      await loadLocalData();
    } else {
      setError(json.error || 'Unable to sync Ashby live-job candidates/applications.');
    }
    setSyncing(null);
  }

  return <AppShellStatic>
    <div className="page-hero v11-page-hero">
      <div>
        <p className="eyebrow">Ashby</p>
        <h1 className="h1">Ashby Workspace</h1>
        <p className="muted">Persist jobs and live Ashby candidates in Lean Talent Intelligence, then push curated candidates back to Ashby.</p>
      </div>
      <div className="modal-actions">
        <button className="btn secondary" disabled={syncing !== null} onClick={syncJobs}><RefreshCw size={14}/> {syncing === 'jobs' ? 'Syncing jobs...' : 'Sync jobs'}</button>
        <button className="btn" disabled={syncing !== null} onClick={syncCandidates}><Users size={14}/> {syncing === 'candidates' ? 'Syncing live-job applications...' : 'Sync live-job candidates'}</button>
      </div>
    </div>

    {message && <div className="success">{message}</div>}
    {error && <div className="error">{error}</div>}

    <div className="grid grid-4 ashby-metric-grid">
      <div className="card metric-card"><Briefcase size={18}/><strong>{jobs.length}</strong><span>Ashby jobs stored</span></div>
      <div className="card metric-card"><Users size={18}/><strong>{candidates.length}</strong><span>Ashby candidates mirrored</span></div>
      <div className="card metric-card"><GitBranch size={18}/><strong>{applications.length}</strong><span>Applications mirrored</span></div>
      <div className="card metric-card"><Clock size={18}/><strong>{lastSync ? formatDate(lastSync.finished_at).split(',')[0] : '-'}</strong><span>Last sync</span></div>
    </div>

    <div className="card ashby-search-card">
      <div className="search-row"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Ashby jobs, candidates, applications, stages..." /></div>
    </div>

    <div className="ashby-workspace-grid">
      <section className="card ashby-panel">
        <div className="section-header"><div><h2>Jobs</h2><p className="muted">Stored in Supabase after syncing from Ashby.</p></div><span className="pill">{filteredJobs.length}</span></div>
        <div className="ashby-list">
          {loading ? <p className="muted">Loading...</p> : filteredJobs.length ? filteredJobs.map(job => <div className="ashby-list-item" key={job.id}>
            <div><strong>{job.title}</strong><p className="muted">{[job.department, job.location, job.status].filter(Boolean).join(' · ') || 'No metadata'}</p></div>
            <span className="status-chip">{job.status || 'Unknown'}</span>
          </div>) : <div className="empty-state"><Briefcase size={24}/><p>No jobs stored yet. Click Sync jobs.</p></div>}
        </div>
      </section>

      <section className="card ashby-panel">
        <div className="section-header"><div><h2>Live candidates & applications</h2><p className="muted">Only candidates attached to synced live Ashby jobs are shown here. Broad candidate database sync is intentionally disabled.</p></div><span className="pill">{filteredApplications.length}</span></div>
        <div className="ashby-list">
          {loading ? <p className="muted">Loading...</p> : filteredApplications.length ? filteredApplications.map(app => <div className="ashby-list-item" key={app.id}>
            <div><strong>{app.candidate_name || 'Candidate'}</strong><p className="muted">{[app.job_title, app.stage, app.status].filter(Boolean).join(' · ') || 'Application synced from Ashby'}</p></div>
            <span className="status-chip">{app.stage || app.status || 'Synced'}</span>
          </div>) : <div className="empty-state"><Users size={24}/><p>No job-linked Ashby applications stored yet. Click Sync live-job candidates after syncing jobs.</p></div>}
        </div>
      </section>
    </div>

    <section className="card ashby-panel">
      <div className="section-header"><div><h2>Recent syncs</h2><p className="muted">Audit log for Ashby data transfers.</p></div></div>
      <div className="ashby-list compact">
        {syncRuns.length ? syncRuns.map(run => <div className="ashby-list-item" key={run.id}>
          <div><strong>{run.sync_type}</strong><p className="muted">{formatDate(run.finished_at)} · {run.records_synced || 0} records</p></div>
          <span className={run.status === 'success' ? 'status-chip success-chip' : 'status-chip danger-chip'}>{run.status === 'success' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>} {run.status}</span>
        </div>) : <p className="muted">No syncs yet.</p>}
      </div>
    </section>
  </AppShellStatic>;
}
