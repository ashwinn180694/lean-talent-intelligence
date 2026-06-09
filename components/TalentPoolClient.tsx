'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, UserPlus, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Pool = {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
};

type Membership = {
  pool_id: string;
  candidate_id: string;
};

const emptyForm = { name: '', description: '' };

export default function TalentPoolClient({ initial }: { initial: Pool[] }) {
  const [rows, setRows] = useState<Pool[]>(initial || []);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [q, setQ] = useState('');
  const [candidateQ, setCandidateQ] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setRows(initial || []);
    try {
      const serialized = JSON.stringify(initial || []);
      sessionStorage.setItem('lean_cache_talent_pools_v1', serialized);
      localStorage.setItem('lean_cache_talent_pools_v1', serialized);
    } catch {}
  }, [initial]);

  useEffect(() => {
    async function loadMembershipData() {
      const [{ data: candidateRows }, { data: membershipRows }] = await Promise.all([
        supabase.from('candidates_view').select('id,full_name,title,company_name,function_area,status,owner_email').order('full_name'),
        supabase.from('candidate_pools').select('pool_id,candidate_id')
      ]);
      if (candidateRows) setCandidates(candidateRows);
      if (membershipRows) setMemberships(membershipRows as Membership[]);
    }
    loadMembershipData();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(query));
  }, [rows, q]);

  const selectedMemberships = useMemo(() => {
    if (!selectedPool) return [];
    const ids = new Set(memberships.filter(m => m.pool_id === selectedPool.id).map(m => m.candidate_id));
    return candidates.filter(c => ids.has(c.id));
  }, [selectedPool, memberships, candidates]);

  const candidateOptions = useMemo(() => {
    if (!selectedPool) return [];
    const memberIds = new Set(selectedMemberships.map(c => c.id));
    const query = candidateQ.trim().toLowerCase();
    return candidates
      .filter(c => !memberIds.has(c.id))
      .filter(c => !query || `${c.full_name} ${c.title || ''} ${c.company_name || ''} ${c.function_area || ''}`.toLowerCase().includes(query))
      .slice(0, 12);
  }, [selectedPool, selectedMemberships, candidateQ, candidates]);

  function poolCount(poolId: string) {
    return memberships.filter(m => m.pool_id === poolId).length;
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage(''); setError('');
  }

  function startEdit(pool: Pool) {
    setEditingId(pool.id);
    setForm({ name: pool.name || '', description: pool.description || '' });
    setSelectedPool(null);
    setShowForm(true);
    setMessage(''); setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function logActivity(action: string, entityName: string) {
    const { data } = await supabase.auth.getSession();
    await supabase.from('activity_feed').insert({ actor_email: data?.session?.user?.email || null, action, entity_type: 'talent_pool', entity_name: entityName });
  }

  async function savePool(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setError(''); setMessage('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null
    };

    if (editingId) {
      const { data, error } = await supabase
        .from('talent_pools')
        .update(payload)
        .eq('id', editingId)
        .select('*')
        .single();

      setSaving(false);
      if (error) { setError(error.message); return; }
      setRows(rows.map((p) => (p.id === editingId ? data as Pool : p)));
      setMessage('Talent pool updated.');
      logActivity('updated talent pool', payload.name);
      resetForm();
      return;
    }

    const { data, error } = await supabase
      .from('talent_pools')
      .insert(payload)
      .select('*')
      .single();

    setSaving(false);
    if (error) { setError(error.message); return; }
    setRows([data as Pool, ...rows]);
    setSelectedPool(data as Pool);
    setMessage('Talent pool created.');
    logActivity('created talent pool', payload.name);
    resetForm();
  }

  async function deletePool(pool: Pool) {
    const ok = window.confirm(`Delete talent pool "${pool.name}"?`);
    if (!ok) return;
    setError(''); setMessage('');
    const { error } = await supabase.from('talent_pools').delete().eq('id', pool.id);
    if (error) { setError(error.message); return; }
    setRows(rows.filter((p) => p.id !== pool.id));
    setMemberships(prev => prev.filter(m => m.pool_id !== pool.id));
    if (editingId === pool.id) resetForm();
    if (selectedPool?.id === pool.id) setSelectedPool(null);
    setMessage('Talent pool deleted.');
    logActivity('deleted talent pool', pool.name);
  }

  async function addCandidateToPool(candidate: any) {
    if (!selectedPool) return;
    setError(''); setMessage('');
    const payload = { pool_id: selectedPool.id, candidate_id: candidate.id };
    const { error } = await supabase.from('candidate_pools').insert(payload);
    if (error) { setError(error.message); return; }
    setMemberships(prev => [...prev, payload]);
    setCandidateQ('');
    setMessage(`${candidate.full_name} added to ${selectedPool.name}.`);
    logActivity('added candidate to talent pool', selectedPool.name);
  }

  async function removeCandidateFromPool(candidate: any) {
    if (!selectedPool) return;
    setError(''); setMessage('');
    const { error } = await supabase.from('candidate_pools').delete().eq('pool_id', selectedPool.id).eq('candidate_id', candidate.id);
    if (error) { setError(error.message); return; }
    setMemberships(prev => prev.filter(m => !(m.pool_id === selectedPool.id && m.candidate_id === candidate.id)));
    setMessage(`${candidate.full_name} removed from ${selectedPool.name}.`);
    logActivity('removed candidate from talent pool', selectedPool.name);
  }

  return (
    <>
      <div className="toolbar company-toolbar">
        <div className="company-filter-group">
          <input
            className="input"
            style={{ maxWidth: 420 }}
            placeholder="Search talent pools..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button className="btn" type="button" onClick={startCreate}><Plus size={16}/> Add Talent Pool</button>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="grid grid-3">
        {filtered.map((pool) => (
          <div className="card clickable-card pool-card-v94" key={pool.id} onClick={() => { setSelectedPool(pool); setCandidateQ(''); }}>
            <div className="pool-card-top">
              <div className="card-title">{pool.name}</div>
              <span className="pool-count-pill"><Users size={13}/>{poolCount(pool.id)}</span>
            </div>
            <p className="muted">{pool.description || 'No description yet.'}</p>
            <div className="actions" onClick={(e) => e.stopPropagation()}>
              <button className="btn secondary" type="button" onClick={() => startEdit(pool)}><Pencil size={14}/> Edit</button>
              <button className="btn secondary" type="button" onClick={() => deletePool(pool)}><Trash2 size={14}/> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="card"><p className="muted">No talent pools found.</p></div>}

      {showForm && <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <h2>{editingId ? 'Edit talent pool' : 'Create talent pool'}</h2>
              <p className="muted">Define a reusable sourcing group without leaving this page.</p>
            </div>
            <button className="icon-btn" type="button" onClick={resetForm} aria-label="Close"><X size={20}/></button>
          </div>
          <form className="grid" onSubmit={savePool}>
            <label>Pool name<input
              className="input"
              placeholder="Open Banking Product Leaders"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            /></label>
            <label>Description / sourcing criteria<textarea
              className="input"
              placeholder="Describe who belongs in this pool, regions, functions, levels, or target companies."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            /></label>
            <div className="modal-actions">
              <button className="btn" disabled={saving}>{saving ? 'Saving...' : editingId ? <><Save size={14}/> Save changes</> : <><Plus size={14}/> Create pool</>}</button>
              <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      </div>}

      {selectedPool && <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card drilldown-modal talent-pool-membership-modal">
          <div className="modal-header">
            <div>
              <h2>{selectedPool.name}</h2>
              <p className="muted">{selectedMemberships.length} candidate{selectedMemberships.length === 1 ? '' : 's'} in this pool</p>
            </div>
            <button className="icon-btn" onClick={() => setSelectedPool(null)} aria-label="Close"><X size={20}/></button>
          </div>
          <p>{selectedPool.description || 'No description yet.'}</p>

          <div className="pool-membership-layout">
            <section className="pool-members-panel">
              <div className="section-kicker">Pool members</div>
              {selectedMemberships.length ? selectedMemberships.map(candidate => <div key={candidate.id} className="pool-member-row">
                <div>
                  <Link className="table-link" href={`/candidates/${candidate.id}`}>{candidate.full_name}</Link>
                  <div className="muted">{candidate.title || 'No title'} · {candidate.company_name || 'No company'}</div>
                  <div className="muted">{candidate.function_area || 'Unassigned'} · {candidate.status || 'Mapped'}</div>
                </div>
                <button className="btn secondary" onClick={() => removeCandidateFromPool(candidate)}>Remove</button>
              </div>) : <div className="empty-state"><p>No candidates in this pool yet.</p></div>}
            </section>

            <section className="pool-members-panel">
              <div className="section-kicker">Add candidates</div>
              <input className="input" placeholder="Search candidates by name, title, company..." value={candidateQ} onChange={e => setCandidateQ(e.target.value)} />
              <div className="candidate-option-list">
                {candidateOptions.map(candidate => <button key={candidate.id} className="candidate-option-row" onClick={() => addCandidateToPool(candidate)}>
                  <UserPlus size={15}/>
                  <span><strong>{candidate.full_name}</strong><em>{candidate.title || 'No title'} · {candidate.company_name || 'No company'}</em></span>
                </button>)}
                {candidateOptions.length === 0 && <p className="muted">No available candidates match this search.</p>}
              </div>
            </section>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => startEdit(selectedPool)}><Pencil size={14}/> Edit pool</button>
            <button className="btn secondary" onClick={() => setSelectedPool(null)}>Close</button>
          </div>
        </div>
      </div>}
    </>
  );
}
