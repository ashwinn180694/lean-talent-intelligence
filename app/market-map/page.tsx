import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Company } from '@/lib/types';
import PrintButton from './PrintButton';

// Tier color tokens — all via CSS variables where possible, with inline fallbacks
// that still use design system intent (brand = Tier 1, muted for lower tiers)
const TIER_PILL: Record<string, { background: string; color: string; border: string }> = {
  'Tier 1': {
    background: 'var(--brand-pill-bg, rgba(196,126,58,0.12))',
    color: 'var(--brand)',
    border: '1px solid rgba(196,126,58,0.3)',
  },
  'Tier 2': {
    background: 'var(--tier2-pill-bg, rgba(99,120,200,0.1))',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
  'Tier 3': {
    background: 'var(--page-bg)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  },
};

const LEGEND = [
  { tier: 'Tier 1', label: 'Priority — highest fit' },
  { tier: 'Tier 2', label: 'Strong fit' },
  { tier: 'Tier 3', label: 'Watch list / emerging' },
];

function CompanyPill({ company }: { company: Company }) {
  const style = TIER_PILL[company.priority_tier ?? 'Tier 3'] ?? TIER_PILL['Tier 3'];
  return (
    <a
      href={`/companies/${company.id}`}
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '99px',
        fontSize: '11.5px',
        fontWeight: 500,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.12s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
    >
      {company.name}
      {company.lean_fit_score != null && (
        <span style={{ fontSize: '10px', opacity: 0.7 }}>{company.lean_fit_score}</span>
      )}
    </a>
  );
}

export default async function MarketMapPage() {
  const supabase = createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('lean_fit_score', { ascending: false });

  const allCompanies: Company[] = companies ?? [];

  // Group by sub_sector, fallback to sector, then "Other"
  const grouped: Record<string, Company[]> = {};
  for (const c of allCompanies) {
    const key = c.sub_sector || c.sector || 'Other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  // Sort sectors: prioritise those with Tier 1 companies first, then by count
  const sectors = Object.keys(grouped).sort((a, b) => {
    const aTier1 = grouped[a].filter(c => c.priority_tier === 'Tier 1').length;
    const bTier1 = grouped[b].filter(c => c.priority_tier === 'Tier 1').length;
    if (bTier1 !== aTier1) return bTier1 - aTier1;
    return grouped[b].length - grouped[a].length;
  });

  return (
    <AppShell>
      <div className="page-enter" style={{ padding: '28px 32px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Market Map
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
              {allCompanies.length} companies across {sectors.length} segments
            </p>
          </div>
          <PrintButton />
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          marginBottom: '28px',
          padding: '10px 16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>
            Legend
          </span>
          {LEGEND.map(({ tier, label }) => {
            const s = TIER_PILL[tier];
            return (
              <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ ...s, padding: '2px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: 500 }}>
                  {tier}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Landscape grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {sectors.map(sector => {
            const sectorCompanies = grouped[sector];
            const tier1Count = sectorCompanies.filter(c => c.priority_tier === 'Tier 1').length;
            return (
              <div
                key={sector}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <h2 style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.3,
                  }}>
                    {sector}
                  </h2>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', background: 'var(--page-bg)', padding: '1px 6px', borderRadius: '99px', border: '1px solid var(--border)' }}>
                      {sectorCompanies.length}
                    </span>
                    {tier1Count > 0 && (
                      <span style={{ fontSize: '10.5px', color: 'var(--brand)', background: 'var(--brand-pill-bg, rgba(196,126,58,0.1))', padding: '1px 6px', borderRadius: '99px', border: '1px solid rgba(196,126,58,0.25)' }}>
                        {tier1Count} T1
                      </span>
                    )}
                  </div>
                </div>

                {/* Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {sectorCompanies.map(company => (
                    <CompanyPill key={company.id} company={company} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
