import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, groupByValue, tierOneCount, topCompanies } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function GeographiesPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const groups = groupByValue(companies, c => c.region).filter(([n]) => n !== 'Unknown');

  return (
    <AppShell>
      <div className="page-enter" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: '4px' }}>Market map</p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Geographies</h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>{groups.length} regions across {companies.length} companies.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {groups.map(([name, rows]) => {
            const preview = topCompanies(rows, 4);
            return (
              <Link
                key={name}
                href={`/geographies/${encodeURIComponent(name)}`}
                className="hover-card"
                style={{
                  display: 'block', background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '18px', textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{name}</h2>
                  <span style={{ background: 'rgba(196,126,58,0.1)', color: 'var(--brand)', borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 500 }}>{rows.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>Avg fit <strong style={{ color: 'var(--text-secondary)' }}>{avgFit(rows) || '—'}</strong></span>
                  <span>Tier 1 <strong style={{ color: 'var(--text-secondary)' }}>{tierOneCount(rows)}</strong></span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {preview.map(c => (
                    <div key={c.id} style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--page-bg)', borderRadius: '5px', padding: '3px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                  ))}
                  {rows.length > 4 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--brand)' }}>
                      +{rows.length - 4} more <ArrowRight size={10} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
