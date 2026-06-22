import Link from 'next/link';
import type { Company } from '@/lib/types';
import { avgFit, categoryClass, fitTone, slugify, tierOneCount, topCompanies } from '@/lib/market';

export function MarketHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="market-hero">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  </div>;
}

export function MarketGroupCard({ title, description, companies, href, tone }: { title: string; description: string; companies: Company[]; href: string; tone?: string }) {
  const top = topCompanies(companies, 4);
  return <Link href={href} className={`market-main-card ${tone || categoryClass(title)}`}>
    <div className="market-card-topline">
      <span className="market-card-label">{description}</span>
      <span className="market-count">{companies.length}</span>
    </div>
    <h2>{title}</h2>
    <div className="market-metrics-row">
      <span><strong>{avgFit(companies) || '-'}</strong><small>Avg fit</small></span>
      <span><strong>{tierOneCount(companies)}</strong><small>Tier 1</small></span>
      <span><strong>{top.length}</strong><small>Preview</small></span>
    </div>
    <div className="market-subcards">
      {top.length ? top.map(company => <div className="market-subcard" key={company.id}>
        <strong>{company.name}</strong>
        <span>{company.sub_sector || company.region || 'Market'} · Fit {company.lean_fit_score || '-'}</span>
      </div>) : <div className="market-empty-mini">No companies yet</div>}
    </div>
  </Link>;
}

export function CompanySubCard({ company }: { company: Company }) {
  return <Link href={`/companies/${company.id}`} className="market-company-subcard">
    <div className="company-subcard-header">
      <strong>{company.name}</strong>
      <span className={`fit-dot ${fitTone(company.lean_fit_score)}`}>{company.lean_fit_score || '-'}</span>
    </div>
    <div className="company-subcard-meta">
      <span className={`category-mini ${categoryClass(company.sub_sector)}`}>{company.sub_sector || 'Global Fintech'}</span>
      <span>{company.country || company.region || 'Global'}</span>
    </div>
    {company.rationale && <p>{company.rationale.slice(0, 120)}{company.rationale.length > 120 ? '…' : ''}</p>}
  </Link>;
}

export function CompanyGrid({ companies }: { companies: Company[] }) {
  return <div className="market-company-grid">
    {topCompanies(companies, 200).map(company => <CompanySubCard key={company.id} company={company} />)}
  </div>;
}

export function MarketWorkspaceHeader({ label, companies }: { label: string; companies: Company[] }) {
  return <div className="market-workspace-header">
    <div>
      <p className="eyebrow">Market workspace</p>
      <h1>{label}</h1>
      <p className="muted">Companies inside this market, ranked by Lean fit and priority.</p>
    </div>
    <div className="market-workspace-stats">
      <span><strong>{companies.length}</strong><small>Companies</small></span>
      <span><strong>{avgFit(companies) || '-'}</strong><small>Avg fit</small></span>
      <span><strong>{tierOneCount(companies)}</strong><small>Tier 1</small></span>
    </div>
  </div>;
}

export function marketHref(base: string, value: string) {
  return `${base}/${slugify(value)}`;
}
