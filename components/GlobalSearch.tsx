'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Plus, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Hit = {
  id: string;
  title: string;
  sub: string;
  href: string;
};

const CATS = ['Neobank','Payments','Lending','Insurance','WealthTech','Crypto / Digital Assets','RegTech','Open Banking','Remittance','Stablecoin','BaaS','BNPL'];
const REGIONS = ['UAE','KSA','Egypt','Bahrain','Kuwait','Oman','Qatar','Jordan','Africa','Global'];
const TIERS = ['Tier 1', 'Tier 2', 'Tier 3'];

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add company modal state
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', region: '', tier: 'Tier 2', fit: '7', website: '' });
  const [saving, setSaving] = useState(false);

  // Fetch company index + total once
  useEffect(() => {
    supabase.from('companies').select('id,name,sub_sector,region,lean_fit_score,priority_tier', { count: 'exact' }).limit(1200)
      .then(({ data, count }) => {
        setCompanies(data || []);
        setTotal(count ?? 0);
      });
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mac = navigator.platform.toLowerCase().includes('mac');
      if ((mac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape') { setOpen(false); setAddOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else setQuery('');
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return companies
      .filter(c => `${c.name} ${c.sub_sector} ${c.region} ${c.priority_tier}`.toLowerCase().includes(q))
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        title: c.name,
        sub: `${c.sub_sector || 'Company'} · ${c.region || 'Global'}${c.lean_fit_score ? ` · Fit ${c.lean_fit_score}` : ''}`,
        href: `/companies/${c.id}`,
      }));
  }, [query, companies]);

  async function handleAddCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from('companies').insert({
      name: form.name.trim(),
      sub_sector: form.category || null,
      region: form.region || null,
      priority_tier: form.tier,
      lean_fit_score: parseFloat(form.fit) || null,
      website_url: form.website || null,
    }).select('id').single();
    setSaving(false);
    setAddOpen(false);
    setForm({ name: '', category: '', region: '', tier: 'Tier 2', fit: '7', website: '' });
    if (data?.id) router.push(`/companies/${data.id}`);
    else router.refresh();
  }

  return (
    <>
      {/* Topbar */}
      <div style={{
        height: '56px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#1B1B1F',
      }}>
        {/* Search trigger */}
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            flex: 1, maxWidth: '440px',
            background: '#212329', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '8px 12px',
            fontSize: '13px', color: '#5b6066', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'border-color 0.12s', textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        >
          <Search size={14} style={{ flexShrink: 0, color: '#5b6066' }} />
          <span style={{ flex: 1 }}>Search companies, categories, regions…</span>
          <kbd style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#5b6066',
            background: 'rgba(255,255,255,0.05)', borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '1px 6px',
          }}>⌘K</kbd>
        </button>

        {/* Right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {total > 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11.5px', color: '#5b6066',
            }}>
              {total} companies tracked
            </span>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="btn-primary"
            style={{ gap: '6px' }}
          >
            <Plus size={14} />
            Add company
          </button>
        </div>
      </div>

      {/* Search modal */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            background: 'rgba(10,11,13,0.62)', backdropFilter: 'blur(4px)',
            paddingTop: '80px', paddingLeft: '16px', paddingRight: '16px',
            animation: 'overlayIn 0.18s ease',
          }}
        >
          <div style={{
            background: '#1B1B1F', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.07)',
            width: '100%', maxWidth: '520px', overflow: 'hidden',
            animation: 'modalIn 0.26s cubic-bezier(0.2,0.8,0.2,1)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px',
            }}>
              <Search size={15} style={{ color: '#5b6066', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search Plaid, Payments, UAE…"
                style={{
                  flex: 1, background: 'transparent', fontSize: '14px',
                  color: '#FFFFFF', border: 'none', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button onClick={() => setOpen(false)} style={{ color: '#5b6066', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '6px' }}>
              {query.trim().length < 2 && (
                <p style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: '#5b6066' }}>
                  Type at least 2 characters…
                </p>
              )}
              {query.trim().length >= 2 && hits.length === 0 && (
                <p style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: '#5b6066' }}>
                  No results found.
                </p>
              )}
              {hits.map(hit => (
                <Link
                  key={hit.id}
                  href={hit.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    borderRadius: '8px', padding: '9px 10px', textDecoration: 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{
                    display: 'flex', width: '30px', height: '30px', flexShrink: 0,
                    alignItems: 'center', justifyContent: 'center', borderRadius: '7px',
                    background: 'rgba(61,214,140,0.10)', color: '#3DD68C',
                  }}>
                    <Building2 size={15} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hit.title}</p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#787F85', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hit.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Company modal */}
      {addOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setAddOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            background: 'rgba(10,11,13,0.62)', backdropFilter: 'blur(4px)',
            paddingTop: '80px', paddingLeft: '16px', paddingRight: '16px',
            animation: 'overlayIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1B1B1F', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.07)',
              width: '100%', maxWidth: '540px',
              animation: 'modalIn 0.26s cubic-bezier(0.2,0.8,0.2,1)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>New talent pool</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>Add company</h2>
                <button onClick={() => setAddOpen(false)} style={{ background: 'none', border: 'none', color: '#787F85', cursor: 'pointer', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCompany} style={{ padding: '20px 24px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Company name *</label>
                <input
                  className="field-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Stripe"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="field-label">Category</label>
                  <select className="field-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select…</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Region</label>
                  <select className="field-select" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                    <option value="">Select…</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="field-label">Priority tier</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {TIERS.map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, tier: t }))}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                          cursor: 'pointer', border: '1px solid',
                          background: form.tier === t ? '#3DD68C' : 'transparent',
                          color: form.tier === t ? '#0c1f16' : '#787F85',
                          borderColor: form.tier === t ? '#3DD68C' : 'rgba(255,255,255,0.10)',
                          transition: 'all 0.12s',
                        }}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label">Fit score (0–10)</label>
                  <input
                    className="field-input"
                    type="number" min="0" max="10" step="0.1"
                    value={form.fit}
                    onChange={e => setForm(f => ({ ...f, fit: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Website (optional)</label>
                <input
                  className="field-input"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://…"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={!form.name.trim() || saving} style={{ opacity: !form.name.trim() ? 0.45 : 1 }}>
                  {saving ? 'Adding…' : 'Add to universe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
