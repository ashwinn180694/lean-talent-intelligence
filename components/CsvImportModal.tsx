'use client';

import { useRef, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Row = Record<string, string>;
type ResultRow = { name: string; status: 'inserted' | 'updated' | 'error'; error?: string };

// Map common column name variants to our schema fields
const FIELD_MAP: Record<string, string> = {
  'company': 'name', 'company name': 'name', 'name': 'name',
  'tier': 'priority_tier', 'priority tier': 'priority_tier', 'priority_tier': 'priority_tier',
  'category': 'sub_sector', 'sector': 'sub_sector', 'sub sector': 'sub_sector', 'sub_sector': 'sub_sector',
  'region': 'region',
  'country': 'country',
  'fit': 'lean_fit_score', 'fit score': 'lean_fit_score', 'lean_fit_score': 'lean_fit_score',
  'website': 'website_url', 'website url': 'website_url', 'website_url': 'website_url',
  'linkedin': 'linkedin_company_url', 'linkedin url': 'linkedin_company_url', 'linkedin_company_url': 'linkedin_company_url',
  'careers': 'careers_url', 'careers url': 'careers_url', 'careers_url': 'careers_url',
  'functions': 'recommended_functions', 'recommended functions': 'recommended_functions',
  'description': 'description', 'about': 'description',
  'rationale': 'rationale',
  'headcount': 'headcount_range', 'headcount range': 'headcount_range',
  'stage': 'funding_stage', 'funding stage': 'funding_stage',
  'raised': 'total_raised', 'total raised': 'total_raised',
  'founded': 'founded_year', 'founded year': 'founded_year',
  'investors': 'key_investors', 'key investors': 'key_investors',
};

function normalizeTier(v: string) {
  const t = v.trim().toLowerCase();
  if (t === '1' || t === 'tier 1' || t === 'tier1' || t === 't1') return 'Tier 1';
  if (t === '2' || t === 'tier 2' || t === 'tier2' || t === 't2') return 'Tier 2';
  if (t === '3' || t === 'tier 3' || t === 'tier3' || t === 't3') return 'Tier 3';
  return v.trim();
}

function parseCSV(text: string): { headers: string[]; rows: Row[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cells.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cells.push(cur);
    return cells;
  };
  const headers = parseRow(lines[0]).map(h => h.trim());
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const cells = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, (cells[i] || '').trim()]));
  });
  return { headers, rows };
}

export default function CsvImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  function handleFile(file: File) {
    setError('');
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.rows.length === 0) { setError('No rows found in this CSV.'); return; }
      if (!parsed.headers.some(h => FIELD_MAP[h.toLowerCase()] === 'name')) {
        setError('CSV must have a "name" or "company" column.');
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setStep('preview');
    };
    reader.readAsText(file);
  }

  function mapRow(row: Row) {
    const out: Record<string, any> = {};
    for (const [header, val] of Object.entries(row)) {
      const field = FIELD_MAP[header.toLowerCase()];
      if (!field || !val) continue;
      if (field === 'lean_fit_score') out[field] = parseFloat(val) || null;
      else if (field === 'founded_year') out[field] = parseInt(val) || null;
      else if (field === 'priority_tier') out[field] = normalizeTier(val);
      else out[field] = val;
    }
    return out;
  }

  async function runImport() {
    setImporting(true);
    const res: ResultRow[] = [];
    for (const row of rows) {
      const mapped = mapRow(row);
      const name = mapped.name;
      if (!name) { res.push({ name: '(blank)', status: 'error', error: 'Missing name' }); continue; }
      // Check if exists
      const { data: existing } = await supabase.from('companies').select('id').eq('name', name).maybeSingle();
      if (existing) {
        const { error: e } = await supabase.from('companies').update(mapped).eq('id', existing.id);
        res.push({ name, status: e ? 'error' : 'updated', error: e?.message });
      } else {
        const { error: e } = await supabase.from('companies').insert(mapped);
        res.push({ name, status: e ? 'error' : 'inserted', error: e?.message });
      }
    }
    setResults(res);
    setImporting(false);
    setStep('done');
  }

  const inserted = results.filter(r => r.status === 'inserted').length;
  const updated = results.filter(r => r.status === 'updated').length;
  const errors = results.filter(r => r.status === 'error').length;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        background: 'rgba(10,11,13,0.65)', backdropFilter: 'blur(4px)',
        paddingTop: '60px', padding: '60px 16px 16px',
        animation: 'overlayIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1B1B1F', borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.07)',
          width: '100%', maxWidth: '580px',
          animation: 'modalIn 0.26s cubic-bezier(0.2,0.8,0.2,1)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
          maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Bulk import</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#EDEEF0' }}>Import companies from CSV</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#787F85', cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>

          {/* Upload step */}
          {step === 'upload' && (
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#787F85', lineHeight: '1.55' }}>
                Upload a CSV file with company data. Existing companies (matched by name) will be updated; new ones will be added.
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#5b6066' }}>
                Supported columns: <span style={{ color: '#ADB1B8' }}>name, tier, category, region, country, fit, website, linkedin, careers, functions, description, headcount, stage, raised, founded, investors</span>
              </p>

              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                style={{
                  border: '2px dashed rgba(61,214,140,0.25)', borderRadius: '10px',
                  padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(61,214,140,0.03)', transition: 'border-color 0.12s, background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(61,214,140,0.45)'; (e.currentTarget as HTMLElement).style.background = 'rgba(61,214,140,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(61,214,140,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(61,214,140,0.03)'; }}
              >
                <Upload size={28} style={{ color: '#3DD68C', marginBottom: '10px' }} />
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 500, color: '#EDEEF0' }}>Click to upload or drag & drop</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#5b6066' }}>CSV files only</p>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              {error && <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#F26669' }}>{error}</p>}
            </div>
          )}

          {/* Preview step */}
          {step === 'preview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <FileText size={16} style={{ color: '#3DD68C' }} />
                <span style={{ fontSize: '13px', color: '#ADB1B8' }}>{rows.length} rows ready to import</span>
                <button onClick={() => setStep('upload')} style={{ marginLeft: 'auto', fontSize: '12px', color: '#787F85', background: 'none', border: 'none', cursor: 'pointer' }}>← Change file</button>
              </div>

              {/* Preview table */}
              <div style={{ background: '#212329', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', maxHeight: '280px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(headers.length, 4)}, 1fr)`, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#1B1B1F', position: 'sticky', top: 0 }}>
                  {headers.slice(0, 4).map(h => (
                    <span key={h} style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5b6066' }}>{h}</span>
                  ))}
                </div>
                {rows.slice(0, 10).map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(headers.length, 4)}, 1fr)`, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {headers.slice(0, 4).map(h => (
                      <span key={h} style={{ fontSize: '12.5px', color: '#ADB1B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{row[h] || '—'}</span>
                    ))}
                  </div>
                ))}
                {rows.length > 10 && (
                  <p style={{ margin: 0, padding: '8px 12px', fontSize: '12px', color: '#5b6066' }}>…and {rows.length - 10} more rows</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={runImport} disabled={importing}>
                  {importing ? 'Importing…' : `Import ${rows.length} companies`}
                </button>
              </div>
            </div>
          )}

          {/* Done step */}
          {step === 'done' && (
            <div>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Added', value: inserted, color: '#3DD68C' },
                  { label: 'Updated', value: updated, color: '#46B8D8' },
                  { label: 'Errors', value: errors, color: errors > 0 ? '#F26669' : '#5b6066' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ flex: 1, background: '#212329', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 3px', fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 500, color }}>{value}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#787F85' }}>{label}</p>
                  </div>
                ))}
              </div>

              {errors > 0 && (
                <div style={{ background: 'rgba(242,102,105,0.06)', border: '1px solid rgba(242,102,105,0.18)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                  {results.filter(r => r.status === 'error').map(r => (
                    <p key={r.name} style={{ margin: '0 0 4px', fontSize: '12.5px', color: '#F26669' }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: '5px' }} />
                      {r.name}: {r.error}
                    </p>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setStep('upload')}>Import another</button>
                <button className="btn-primary" onClick={() => { onDone(); onClose(); }}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
