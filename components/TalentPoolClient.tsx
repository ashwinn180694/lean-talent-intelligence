'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

type Pool = {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
};

const emptyForm = { name: '', description: '' };

export default function TalentPoolClient({ initial }: { initial: Pool[] }) {
  const [rows, setRows] = useState<Pool[]>(initial || []);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(query));
  }, [rows, q]);

  function startEdit(pool: Pool) {
    setEditingId(pool.id);
    setForm({ name: pool.name || '', description: pool.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function savePool(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

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
      if (error) return alert(error.message);
      setRows(rows.map((p) => (p.id === editingId ? data as Pool : p)));
      resetForm();
      return;
    }

    const { data, error } = await supabase
      .from('talent_pools')
      .insert(payload)
      .select('*')
      .single();

    setSaving(false);
    if (error) return alert(error.message);
    setRows([data as Pool, ...rows]);
    resetForm();
  }

  async function deletePool(pool: Pool) {
    const ok = window.confirm(`Delete talent pool "${pool.name}"?`);
    if (!ok) return;
    const { error } = await supabase.from('talent_pools').delete().eq('id', pool.id);
    if (error) return alert(error.message);
    setRows(rows.filter((p) => p.id !== pool.id));
    if (editingId === pool.id) resetForm();
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <h2>{editingId ? 'Edit talent pool' : 'Create talent pool'}</h2>
        <form className="grid" onSubmit={savePool}>
          <input
            className="input"
            placeholder="Pool name, e.g. Open Banking Product Leaders"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            className="input"
            placeholder="Description / sourcing criteria"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="actions">
            <button className="btn" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create pool'}</button>
            {editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="toolbar">
        <input
          className="input"
          style={{ maxWidth: 420 }}
          placeholder="Search talent pools..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid grid-3">
        {filtered.map((pool) => (
          <div className="card clickable-card" key={pool.id} onClick={() => setSelectedPool(pool)}>
            <div className="card-title">{pool.name}</div>
            <p className="muted">{pool.description || 'No description yet.'}</p>
            <div className="actions" onClick={(e) => e.stopPropagation()}>
              <button className="btn secondary" type="button" onClick={() => startEdit(pool)}>Edit</button>
              <button className="btn secondary" type="button" onClick={() => deletePool(pool)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="card"><p className="muted">No talent pools found.</p></div>}

      {selectedPool && <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card drilldown-modal">
          <div className="modal-header">
            <div>
              <h2>{selectedPool.name}</h2>
              <p className="muted">Talent pool quick view</p>
            </div>
            <button className="icon-btn" onClick={() => setSelectedPool(null)} aria-label="Close">×</button>
          </div>
          <p>{selectedPool.description || 'No description yet.'}</p>
          <div className="empty-state">
            <p>Candidate membership is the next step for Talent Pools. For now, use this quick view to review the pool and edit its sourcing criteria.</p>
            <div className="actions">
              <button className="btn" onClick={() => { startEdit(selectedPool); setSelectedPool(null); }}>Edit pool</button>
              <button className="btn secondary" onClick={() => setSelectedPool(null)}>Close</button>
            </div>
          </div>
        </div>
      </div>}
    </>
  );
}
