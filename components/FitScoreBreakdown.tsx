'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FitDimension = {
  label: string;
  key: string;
  description: string;
};

const DIMENSIONS: FitDimension[] = [
  { key: 'culture_fit', label: 'Culture fit', description: 'Values alignment, pace, innovation mindset' },
  { key: 'growth_stage', label: 'Growth stage', description: 'Company stage matches Lean talent profile' },
  { key: 'function_overlap', label: 'Function overlap', description: 'Key functions we hire from are present' },
  { key: 'geo_relevance', label: 'Geo relevance', description: 'Location and market overlap with Lean' },
  { key: 'talent_density', label: 'Talent density', description: 'Headcount and senior talent volume' },
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
  const [open, setOpen] = useState(false);
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
    <div style={{ marginTop: '12px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: '11.5px', color: '#787F85', fontFamily: 'inherit',
        }}
      >
        <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
        {hasBreakdown ? 'Score breakdown' : 'Add score breakdown'}
      </button>

      {open && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DIMENSIONS.map(({ key, label, description }) => {
            const val = scores[key] ?? 0;
            const color = scoreColor(val);
            return (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-hi)', fontWeight: 500 }}>{label}</span>
                    {!editing && <span style={{ fontSize: '11px', color: '#5b6066', marginLeft: '6px' }}>{description}</span>}
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
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                      fontWeight: 600, color: val > 0 ? color : '#5b6066',
                    }}>
                      {val > 0 ? val.toFixed(1) : '—'}
                    </span>
                  )}
                </div>
                {!editing && val > 0 && (
                  <div style={{ height: '3px', borderRadius: '99px', background: 'var(--border)' }}>
                    <div style={{ width: `${(val / 10) * 100}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.3s' }} />
                  </div>
                )}
              </div>
            );
          })}

          {editable && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}>
                    {saving ? 'Saving…' : 'Save scores'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>
                  {hasBreakdown ? 'Edit scores' : 'Add scores'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
