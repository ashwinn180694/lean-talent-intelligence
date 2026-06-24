'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, X, Linkedin, Trash2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Candidate = {
  id: string;
  name: string;
  linkedin_url: string | null;
  current_position: string | null;
  notes: string | null;
  stage: string;
  created_at: string;
  added_by: string | null;
};

const STAGES = ['Identified', 'Contacted', 'Responded', 'Interviewing', 'Offer', 'Hired', 'Declined'];

function stageColor(stage: string) {
  const map: Record<string, { color: string; bg: string }> = {
    'Identified':   { color: '#787F85', bg: 'rgba(120,127,133,0.12)' },
    'Contacted':    { color: '#46B8D8', bg: 'rgba(70,184,216,0.12)' },
    'Responded':    { color: '#9AB654', bg: 'rgba(154,182,84,0.12)' },
    'Interviewing': { color: '#D6A35C', bg: 'rgba(214,163,92,0.12)' },
    'Offer':        { color: '#3DD68C', bg: 'rgba(61,214,140,0.12)' },
    'Hired':        { color: '#3DD68C', bg: 'rgba(61,214,140,0.20)' },
    'Declined':     { color: '#F26669', bg: 'rgba(242,102,105,0.12)' },
  };
  return map[stage] || { color: '#787F85', bg: 'rgba(120,127,133,0.12)' };
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase();
}

const emptyForm = { name: '', linkedin_url: '', current_position: '', notes: '', stage: 'Identified' };

export default function CompanyCandidates({ companyId }: { companyId: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    fetchCandidates();
  }, [companyId]);

  async function fetchCandidates() {
    setLoading(true);
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setCandidates((data || []) as Candidate[]);
    setLoading(false);
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !userId) return;
    setSaving(true);
    const { data, error } = await supabase.from('candidates').insert({
      company_id: companyId,
      added_by: userId,
      name: form.name.trim(),
      linkedin_url: form.linkedin_url || null,
      current_position: form.current_position || null,
      notes: form.notes || null,
      stage: form.stage,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setCandidates(prev => [data as Candidate, ...prev]);
      setForm(emptyForm);
      setAddOpen(false);
      // Slack alert (fire-and-forget)
      const { data: { user } } = await supabase.auth.getUser();
      fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'candidate_added',
          candidateName: form.name.trim(),
          companyName: document.title.replace(' | Lean Talent Intelligence', ''),
          role: form.current_position || null,
          stage: form.stage,
          addedBy: user?.email || 'team',
          companyUrl: window.location.href,
        }),
      }).catch(() => {});
    }
  }

  async function updateStage(id: string, stage: string) {
    await supabase.from('candidates').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
  }

  async function deleteCandidate(id: string) {
    await supabase.from('candidates').delete().eq('id', id);
    setCandidates(prev => prev.filter(c => c.id !== id));
  }

  const byStageCounts = STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter(c => c.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Users size={14} style={{ color: '#3DD68C' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#787F85', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Candidates
          </span>
          {candidates.length > 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
              background: 'rgba(61,214,140,0.12)', color: '#3DD68C',
              borderRadius: '99px', padding: '1px 7px',
            }}>{candidates.length}</span>
          )}
        </div>
        <button
          onClick={() => setAddOpen(v => !v)}
          className="btn-primary"
          style={{ gap: '5px', padding: '6px 12px', fontSize: '12.5px' }}
        >
          <Plus size={13} /> Add candidate
        </button>
      </div>

      {/* Pipeline mini-bar */}
      {candidates.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {STAGES.filter(s => byStageCounts[s] > 0).map(s => {
            const sc = stageColor(s);
            return (
              <span key={s} style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                background: sc.bg, color: sc.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {s} {byStageCounts[s]}
              </span>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {addOpen && (
        <form onSubmit={addCandidate} style={{
          background: '#1B1B1F', border: '1px solid rgba(61,214,140,0.20)',
          borderRadius: '10px', padding: '16px', marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#EDEEF0' }}>New candidate</span>
            <button type="button" onClick={() => setAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#787F85', display: 'flex' }}>
              <X size={15} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="field-label">Full name *</label>
              <input className="field-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="field-label">Current role</label>
              <input className="field-input" value={form.current_position} onChange={e => setForm(f => ({ ...f, current_position: e.target.value }))} placeholder="Head of Compliance" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="field-label">LinkedIn URL</label>
              <input className="field-input" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/…" />
            </div>
            <div>
              <label className="field-label">Stage</label>
              <select className="field-select" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">Notes</label>
            <textarea
              className="field-input"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any context about this candidate…"
              rows={2}
              style={{ resize: 'none', lineHeight: '1.5' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!form.name.trim() || saving}>
              {saving ? 'Adding…' : 'Add candidate'}
            </button>
          </div>
        </form>
      )}

      {/* Candidates list */}
      {loading ? (
        <p style={{ fontSize: '13px', color: '#5b6066', textAlign: 'center', padding: '16px 0' }}>Loading…</p>
      ) : candidates.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#5b6066', textAlign: 'center', padding: '16px 0' }}>
          No candidates tracked yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {candidates.map(c => {
            const sc = stageColor(c.stage);
            const expanded = expandedId === c.id;
            return (
              <div key={c.id} style={{
                background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '9px', overflow: 'hidden',
              }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(61,214,140,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3DD68C', fontSize: '11px', fontWeight: 700,
                  }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 500, color: '#EDEEF0' }}>{c.name}</p>
                    {c.current_position && <p style={{ margin: 0, fontSize: '12px', color: '#787F85' }}>{c.current_position}</p>}
                  </div>
                  {/* Stage selector */}
                  <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <select
                      value={c.stage}
                      onChange={e => updateStage(c.id, e.target.value)}
                      style={{
                        background: sc.bg, color: sc.color,
                        border: 'none', borderRadius: '99px', padding: '3px 24px 3px 10px',
                        fontSize: '11.5px', fontWeight: 500, cursor: 'pointer',
                        fontFamily: 'inherit', appearance: 'none', outline: 'none',
                      }}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <ChevronDown size={14} style={{ color: '#5b6066', flexShrink: 0, transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
                </div>

                {expanded && (
                  <div style={{ padding: '0 13px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#46B8D8', textDecoration: 'none' }}>
                          <Linkedin size={13} /> View LinkedIn
                        </a>
                      )}
                      {c.notes && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#ADB1B8', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{c.notes}</p>
                      )}
                      {c.added_by === userId && (
                        <button
                          onClick={() => deleteCandidate(c.id)}
                          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5b6066', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#F26669')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#5b6066')}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
