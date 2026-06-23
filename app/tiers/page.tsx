import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, PRIORITY_TIERS, tierOneCount, topCompanies } from '@/lib/market';
import type { Company } from '@/lib/types';

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  'Tier 1': { bg: '#fef7ed', color: '#c47e3a' },
  'Tier 2': { bg: '#eff6ff', color: '#2563eb' },
  'Tier 3': { bg: '#f8f7f4', color: '#9a9080' }
};

export default async function TiersPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const groups = PRIORITY_TIERS.map(tier => ({
    name: tier,
    companies: companies.filter(c => c.priority_tier === tier)
  })).filter(g => g.companies.length > 0);

  return (
    <AppShell>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c47e3a', marginBottom: '4px' }}>Market map</p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Priority Tiers</h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: '#9a9080' }}>Companies ranked by strategic priority.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {groups.map(({ name, companies: rows }) => {
            const preview = topCompanies(rows, 5);
            const style = TIER_STYLES[name] ?? { bg: '#f8f7f4', color: '#9a9080' };
            return (
              <Link
                key={name}
                href={`/tiers/${encodeURIComponent(name)}`}
                className="hover-card"
                style={{
                  display: 'block', background: '#fff', border: '1px solid #e8e6e0',
                  borderRadius: '10px', padding: '18px', textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{name}</h2>
                  <span style={{ background: style.bg, color: style.color, borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 500 }}>{rows.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#9a9080', marginBottom: '12px' }}>
                  <span>Avg fit <strong style={{ color: '#5a5650' }}>{avgFit(rows) || '—'}</strong></span>
                  {name === 'Tier 1' && <span style={{ color: '#c47e3a', fontWeight: 500 }}>Top priority</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {preview.map(c => (
                    <div key={c.id} style={{ fontSize: '11.5px', color: '#9a9080', background: '#f8f7f4', borderRadius: '5px', padding: '3px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
