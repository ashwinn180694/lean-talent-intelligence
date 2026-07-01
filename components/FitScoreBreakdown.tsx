'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

const DIMENSIONS = [
  { key: 'culture_fit',     label: 'Culture fit',      description: 'Values alignment, pace, innovation mindset' },
  { key: 'growth_stage',    label: 'Growth stage',     description: 'Company stage matches Lean talent profile' },
  { key: 'function_overlap',label: 'Function overlap', description: 'Key functions we hire from are present' },
  { key: 'geo_relevance',   label: 'Geo relevance',    description: 'Location and market overlap with Lean' },
  { key: 'talent_density',  label: 'Talent density',   description: 'Headcount and senior talent volume' },
];

function scoreColor(v: number) {
  if (v >= 9) return '#3DD68C';
  if (v >= 7) return '#9AB654';
  if (v >= 5) return '#D6A35C';
  return '#F26669';
}

type Props = {
  companyId: string;
  overallFit: number;
  fitBreakdown?: Record<string, number> | null;
  editable?: boolean;
  onSave?: (breakdown: Record<string, number>) => Promise<void>;
};

export default function FitScoreBreakdown({ companyId, overallFit, fitBreakdown, editable, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>(fitBreakdown || {});
  const [saving, setSaving] = useState(false);

  const hasBreakdown = Object.keys(fitBreakdown || {}).length > 0;

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    await onSave(scores);
    setSaving(false);
    setEditing(false);
  }

  if (!hasBreakdown && !editable) return null;

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '14px 16px', marginBottom: '14px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Fit breakdown
        </p>
        {editable && !editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: 'var(--text-faint)', transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            title={hasBreakdown ? 'Edit scores' : 'Add scores'}
          >
            <Pencil size={12} />
          </button>
        )}
      </div>

      {/* Dimensions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DIMENSIONS.map(({ key, label, description }) => {
          const val = scores[key] ?? 0;
          const color = scoreColor(val);
          return (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-hi)', fontWeight: 500 }}>{label}</span>
                  {!editing && (
                    <span style={{ fontSize: '11px', color: 'var(--text-faint)', marginLeft: '6px' }}>{description}</span>
                  )}
                </div>
                {editing ? (
                  <input
                    type="number" min="0" max="10" step="0.5"
                    value={val || ''}
                    onChange={e => setScores(s => ({ ...s, [key]: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '52px', background: 'var(--app-bg)', border: '1px solid var(--border)',
                      borderRadius: '5px', color: 'var(--text-hi)', fontSize: '12px', padding: '3px 6px',
                      fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: val > 0 ? color : 'var(--text-faint)' }}>
                    {val > 0 ? `${val}/10` : '—'}
                  </span>
                )}
              </div>
              {!editing && (
                <div style={{ height: '3px', borderRadius: '99px', background: 'var(--border)' }}>
                  <div style={{ width: `${val * 10}%`, height: '100%', background: val > 0 ? color : 'transparent', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit actions */}
      {editing && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button onClick={() => { setScores(fitBreakdown || {}); setEditing(false); }} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}>
            {saving ? 'Saving…' : 'Save scores'}
          </button>
        </div>
      )}
    </div>
  );
}
