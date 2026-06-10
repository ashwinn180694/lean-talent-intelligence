'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShellStatic from '@/components/AppShellStatic';
import { supabase } from '@/lib/supabase-browser';

type Profile = {
  display_name: string;
  title: string;
  team: string;
  bio: string;
  avatar_url: string;
};

const emptyProfile: Profile = { display_name: '', title: '', team: '', bio: '', avatar_url: '' };

function initials(name: string, email: string) {
  const base = (name || email || 'LT').replace(/@.*/, '');
  const parts = base.split(/[.\s_-]+/).filter(Boolean);
  return `${(parts[0]?.[0] || 'L').toUpperCase()}${(parts[1]?.[0] || 'T').toUpperCase()}`;
}

export default function SettingsPage(){
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [stats, setStats] = useState({ candidates: 0, pools: 0, activity: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ashbyStatus, setAshbyStatus] = useState<any>(null);
  const [ashbyJobs, setAshbyJobs] = useState<any[]>([]);
  const [ashbyLoading, setAshbyLoading] = useState(false);

  const displayName = useMemo(() => profile.display_name || email.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Lean user', [profile.display_name, email]);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email || '';
      setEmail(userEmail);
      if (!userEmail) return;
      const { data } = await supabase.from('user_profiles').select('*').eq('email', userEmail).maybeSingle();
      if (data) setProfile({
        display_name: data.display_name || '',
        title: data.title || '',
        team: data.team || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || ''
      });
      const [{ count: candidates }, { count: pools }, { count: activity }] = await Promise.all([
        supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('owner_email', userEmail),
        supabase.from('talent_pools').select('*', { count: 'exact', head: true }).eq('owner_email', userEmail),
        supabase.from('activity_feed').select('*', { count: 'exact', head: true }).eq('actor_email', userEmail)
      ]);
      setStats({ candidates: candidates || 0, pools: pools || 0, activity: activity || 0 });
    }
    load();
  }, []);



  async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function testAshbyConnection() {
    setAshbyLoading(true); setError(''); setMessage('');
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ashby/status', { headers });
    const json = await res.json();
    setAshbyStatus(json);
    setMessage(json.connected ? 'Ashby connection verified.' : 'Ashby connection check completed. Review the status below.');
    setAshbyLoading(false);
  }

  async function loadAshbyJobs() {
    setAshbyLoading(true); setError(''); setMessage('');
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ashby/jobs', { headers });
    const json = await res.json();
    if (json.success) {
      setAshbyJobs(json.jobs || []);
      setMessage(`Loaded ${(json.jobs || []).length} open Ashby jobs.`);
    } else {
      setError(json.error || 'Unable to load Ashby jobs.');
    }
    setAshbyLoading(false);
  }

  async function saveProfile() {
    setSaving(true); setMessage(''); setError('');
    if (!email) { setError('No signed-in user found.'); setSaving(false); return; }
    const payload = { email, ...profile, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'email' });
    if (error) setError(error.message); else setMessage('Profile saved. Activity and ownership will use your display name.');
    setSaving(false);
  }

  return <AppShellStatic>
    <div className="page-hero v11-page-hero">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="h1">Profile & workspace</h1>
        <p className="muted">Manage how your name appears across activity, ownership, and follow-ups.</p>
      </div>
    </div>

    <div className="settings-grid-v11">
      <section className="card profile-hero-card">
        <div className="profile-avatar-large">{initials(displayName, email)}</div>
        <div>
          <h2>{displayName}</h2>
          <p className="muted">{profile.title || 'Talent team member'}{profile.team ? ` · ${profile.team}` : ''}</p>
          <p className="muted">{email}</p>
        </div>
        <div className="profile-stat-grid">
          <div><strong>{stats.candidates}</strong><span>Candidates owned</span></div>
          <div><strong>{stats.pools}</strong><span>Pools owned</span></div>
          <div><strong>{stats.activity}</strong><span>Activity items</span></div>
        </div>
      </section>

      <section className="card profile-form-card">
        <h2>Edit profile</h2>
        <div className="form-grid">
          <label>Display name<input className="input" value={profile.display_name} onChange={(e)=>setProfile({...profile, display_name:e.target.value})} placeholder="Ashwin Narayana" /></label>
          <label>Title<input className="input" value={profile.title} onChange={(e)=>setProfile({...profile, title:e.target.value})} placeholder="Talent Partner" /></label>
          <label>Team<input className="input" value={profile.team} onChange={(e)=>setProfile({...profile, team:e.target.value})} placeholder="Talent" /></label>
          <label>Profile picture URL<input className="input" value={profile.avatar_url} onChange={(e)=>setProfile({...profile, avatar_url:e.target.value})} placeholder="Optional image URL" /></label>
          <label className="full-span">Bio<textarea value={profile.bio} onChange={(e)=>setProfile({...profile, bio:e.target.value})} placeholder="A short internal profile note." /></label>
        </div>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
        <div className="modal-actions" style={{marginTop:16}}>
          <button className="btn secondary" onClick={async()=>{await supabase.auth.signOut(); window.location.href='/login';}}>Sign out</button>
          <button className="btn" disabled={saving} onClick={saveProfile}>{saving ? 'Saving…' : 'Save profile'}</button>
        </div>
      </section>

      <section className="card profile-form-card ashby-settings-card">
        <div className="modal-header" style={{padding: 0, borderBottom: 'none'}}>
          <div>
            <h2>Ashby integration</h2>
            <p className="muted">Test the server-side Ashby API key and preview open jobs. The key is never exposed to the browser.</p>
          </div>
        </div>
        <div className="grid grid-3" style={{marginTop: 14}}>
          <div className="mini-stat"><strong>{ashbyStatus?.configured ? 'Configured' : 'Unknown'}</strong><span>API key</span></div>
          <div className="mini-stat"><strong>{ashbyStatus?.connected ? 'Connected' : 'Not verified'}</strong><span>Status</span></div>
          <div className="mini-stat"><strong>{ashbyJobs.length}</strong><span>Open jobs loaded</span></div>
        </div>
        {ashbyStatus?.error && <div className="error" style={{marginTop: 12}}>{ashbyStatus.error}</div>}
        {ashbyStatus?.message && <div className="success" style={{marginTop: 12}}>{ashbyStatus.message}</div>}
        <div className="modal-actions" style={{marginTop:16}}>
          <button className="btn secondary" disabled={ashbyLoading} onClick={testAshbyConnection}>{ashbyLoading ? 'Checking…' : 'Test connection'}</button>
          <button className="btn" disabled={ashbyLoading} onClick={loadAshbyJobs}>{ashbyLoading ? 'Loading…' : 'Load open jobs'}</button>
        </div>
        <div className="note-list" style={{marginTop: 16}}>
          {ashbyJobs.length ? ashbyJobs.slice(0, 8).map(job => <div className="note-item" key={job.id}><strong>{job.title}</strong><p className="muted">{job.status || 'Open'}{job.department ? ` · ${job.department}` : ''}{job.location ? ` · ${job.location}` : ''}</p><span className="pill">{job.id}</span></div>) : <p className="muted">No jobs loaded yet. Click Load open jobs to confirm Jobs Read access.</p>}
        </div>
      </section>
    </div>
  </AppShellStatic>;
}
