import Link from 'next/link';
import { Tag, Globe, Star, Building2, Lightbulb, ArrowRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';
import { avgFit, groupByValue, MARKET_CATEGORIES, PRIORITY_TIERS, tierOneCount, topCompanies } from '@/lib/market';
import type { Company } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('companies').select('*').order('name');
  const companies = (data || []) as Company[];

  const categories = MARKET_CATEGORIES.map(cat => ({
    name: cat,
    companies: companies.filter(c => (c.sub_sector || 'Global Fintech') === cat)
  })).filter(g => g.companies.length > 0);

  const geographies = groupByValue(companies, c => c.region)
    .filter(([name]) => name !== 'Unknown')
    .slice(0, 8);

  const tiers = PRIORITY_TIERS.map(tier => ({
    name: tier,
    companies: companies.filter(c => c.priority_tier === tier)
  })).filter(g => g.companies.length > 0);

  const highFit = companies.filter(c => (c.lean_fit_score || 0) >= 8 || c.priority_tier === 'Tier 1');

  return (
    <AppShell>
      <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Hero */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c47e3a', marginBottom: '4px' }}>
            Market intelligence
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            Lean Talent Market Map
          </h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: '#9a9080' }}>
            {companies.length} companies across {categories.length} categories and {geographies.length} regions.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total companies', value: companies.length, icon: Building2 },
            { label: 'Tier 1', value: tierOneCount(companies), icon: Star },
            { label: 'Avg fit score', value: avgFit(companies) || '—', icon: Lightbulb },
            { label: 'High-fit universe', value: highFit.length, icon: Lightbulb }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8e6e0', borderRadius: '10px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '8px', background: 'rgba(196,126,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: '#c47e3a' }} />
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{value}</p>
                <p style={{ fontSize: '11.5px', color: '#9a9080', margin: 0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <Section title="Categories" icon={<Tag size={15} />} count={categories.length} href="/categories">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {categories.slice(0, 6).map(({ name, companies: rows }) => (
              <MarketCard
                key={name}
                title={name}
                count={rows.length}
                avgFit={avgFit(rows)}
                tier1={tierOneCount(rows)}
                preview={topCompanies(rows, 3).map(c => c.name)}
                href={`/categories/${encodeURIComponent(name)}`}
              />
            ))}
          </div>
        </Section>

        {/* Geographies */}
        <Section title="Geographies" icon={<Globe size={15} />} count={geographies.length} href="/geographies">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {geographies.slice(0, 6).map(([geo, rows]) => (
              <MarketCard
                key={geo}
                title={geo}
                count={rows.length}
                avgFit={avgFit(rows)}
                tier1={tierOneCount(rows)}
                preview={topCompanies(rows, 3).map(c => c.name)}
                href={`/geographies/${encodeURIComponent(geo)}`}
              />
            ))}
          </div>
        </Section>

        {/* Tiers */}
        <Section title="Priority Tiers" icon={<Star size={15} />} count={tiers.length} href="/tiers">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {tiers.map(({ name, companies: rows }) => (
              <MarketCard
                key={name}
                title={name}
                count={rows.length}
                avgFit={avgFit(rows)}
                tier1={tierOneCount(rows)}
                preview={topCompanies(rows, 3).map(c => c.name)}
                href={`/tiers/${encodeURIComponent(name)}`}
              />
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title, icon, count, href, children
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ color: '#c47e3a', display: 'flex' }}>{icon}</span>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{title}</h2>
          <span style={{ background: '#f0ede8', color: '#9a9080', borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 500 }}>{count}</span>
        </div>
        <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#c47e3a', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function MarketCard({
  title, count, avgFit: avg, tier1, preview, href
}: {
  title: string;
  count: number;
  avgFit: number;
  tier1: number;
  preview: string[];
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block', background: '#fff', border: '1px solid #e8e6e0',
        borderRadius: '10px', padding: '16px', textDecoration: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(196,126,58,0.4)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(196,126,58,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e8e6e0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{title}</h3>
        <span style={{ background: 'rgba(196,126,58,0.1)', color: '#c47e3a', borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 500 }}>{count}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
        <span style={{ fontSize: '11.5px', color: '#9a9080' }}>Avg fit <strong style={{ color: '#5a5650' }}>{avg || '—'}</strong></span>
        <span style={{ fontSize: '11.5px', color: '#9a9080' }}>Tier 1 <strong style={{ color: '#5a5650' }}>{tier1}</strong></span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {preview.map(name => (
          <div key={name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11.5px', color: '#9a9080', background: '#f8f7f4', borderRadius: '5px', padding: '3px 8px' }}>
            {name}
          </div>
        ))}
      </div>
    </Link>
  );
}
