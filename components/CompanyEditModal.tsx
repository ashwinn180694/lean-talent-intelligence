'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';
import { PRIORITY_TIERS, MARKET_CATEGORIES } from '@/lib/market';

const HEADCOUNT_RANGES = [
  '1–10',
  '11–50',
  '51–200',
  '201–500',
  '501–1000',
  '1001–5000',
  '5000+',
];

const FUNDING_STAGES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D',
  'Series E+',
  'Growth',
  'IPO',
  'Acquired',
  'Public',
];

interface Props {
  company: Company;
  onClose: () => void;
  onSave?: (updated: Company) => void;
}

export default function CompanyEditModal({ company, onClose, onSave }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Company>>({ ...company });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof Company>(field: K, value: Company[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const updates = {
      name: form.name?.trim() || company.name,
      description: form.description || null,
      headquarters: form.headquarters || null,
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      headcount_range: form.headcount_range || null,
      funding_stage: form.funding_stage || null,
      total_raised: form.total_raised || null,
      latest_funding_date: form.latest_funding_date || null,
      key_investors: form.key_investors || null,
      website_url: form.website_url || null,
      linkedin_url: form.linkedin_url || null,
      careers_url: form.careers_url || null,
      recommended_functions: form.recommended_functions || null,
      priority_tier: form.priority_tier || null,
      lean_fit_score: form.lean_fit_score != null && String(form.lean_fit_score).trim() !== ''
        ? Number(form.lean_fit_score)
        : null,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', company.id);

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.refresh();
    onSave?.({ ...company, ...updates });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Edit Company
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">

          {/* Basic */}
          <Section title="Basic">
            <FieldRow>
              <Field label="Company name">
                <input
                  className="edit-input"
                  value={form.name || ''}
                  onChange={e => set('name', e.target.value)}
                />
              </Field>
              <Field label="Founded year">
                <input
                  className="edit-input"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={form.founded_year ?? ''}
                  onChange={e => set('founded_year', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
            </FieldRow>
            <Field label="Description">
              <textarea
                className="edit-input resize-none"
                rows={3}
                value={form.description || ''}
                onChange={e => set('description', e.target.value)}
              />
            </Field>
            <Field label="Headquarters">
              <input
                className="edit-input"
                value={form.headquarters || ''}
                onChange={e => set('headquarters', e.target.value)}
              />
            </Field>
            <Field label="Headcount range">
              <select
                className="edit-input"
                value={form.headcount_range || ''}
                onChange={e => set('headcount_range', e.target.value)}
              >
                <option value="">— select —</option>
                {HEADCOUNT_RANGES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </Section>

          {/* Funding */}
          <Section title="Funding">
            <FieldRow>
              <Field label="Funding stage">
                <select
                  className="edit-input"
                  value={form.funding_stage || ''}
                  onChange={e => set('funding_stage', e.target.value)}
                >
                  <option value="">— select —</option>
                  {FUNDING_STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Total raised">
                <input
                  className="edit-input"
                  placeholder="e.g. $120M"
                  value={form.total_raised || ''}
                  onChange={e => set('total_raised', e.target.value)}
                />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Latest funding date">
                <input
                  className="edit-input"
                  type="date"
                  value={form.latest_funding_date?.slice(0, 10) || ''}
                  onChange={e => set('latest_funding_date', e.target.value)}
                />
              </Field>
              <Field label="Key investors">
                <input
                  className="edit-input"
                  placeholder="Comma-separated"
                  value={form.key_investors || ''}
                  onChange={e => set('key_investors', e.target.value)}
                />
              </Field>
            </FieldRow>
          </Section>

          {/* Links */}
          <Section title="Links">
            <Field label="Website URL">
              <input
                className="edit-input"
                placeholder="https://…"
                value={form.website_url || ''}
                onChange={e => set('website_url', e.target.value)}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                className="edit-input"
                placeholder="https://linkedin.com/company/…"
                value={form.linkedin_url || ''}
                onChange={e => set('linkedin_url', e.target.value)}
              />
            </Field>
            <Field label="Careers URL">
              <input
                className="edit-input"
                placeholder="https://…"
                value={form.careers_url || ''}
                onChange={e => set('careers_url', e.target.value)}
              />
            </Field>
          </Section>

          {/* Intelligence */}
          <Section title="Intelligence">
            <Field label="Recommended functions">
              <input
                className="edit-input"
                placeholder="e.g. Engineering, Product, Sales"
                value={form.recommended_functions || ''}
                onChange={e => set('recommended_functions', e.target.value)}
              />
            </Field>
            <FieldRow>
              <Field label="Priority tier">
                <select
                  className="edit-input"
                  value={form.priority_tier || ''}
                  onChange={e => set('priority_tier', e.target.value)}
                >
                  <option value="">— select —</option>
                  {PRIORITY_TIERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Lean fit score (1–10)">
                <input
                  className="edit-input"
                  type="number"
                  min={1}
                  max={10}
                  value={form.lean_fit_score ?? ''}
                  onChange={e => set('lean_fit_score', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
            </FieldRow>
          </Section>

          {error && (
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex justify-end gap-2 px-6 py-4"
          style={{
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-1.5"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .edit-input {
          width: 100%;
          padding: 0.4rem 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: var(--page-bg);
          color: var(--text-primary);
          border: 1px solid var(--border);
          outline: none;
          transition: border-color 0.15s;
        }
        .edit-input:focus {
          border-color: var(--brand);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3
        className="text-xs font-semibold uppercase tracking-wider pb-2"
        style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
