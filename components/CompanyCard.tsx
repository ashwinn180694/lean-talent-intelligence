'use client';

import Link from 'next/link';
import { Globe, Linkedin } from 'lucide-react';
import { fitTone } from '@/lib/market';
import type { Company } from '@/lib/types';
import WatchlistButton from '@/components/WatchlistButton';

const FIT_STYLES: Record<string, { bg: string; color: string }> = {
  high:    { bg: '#f0fdf4', color: '#15803d' },
  mid:     { bg: '#fffbeb', color: '#b45309' },
  low:     { bg: '#fef2f2', color: '#dc2626' },
  neutral: { bg: '#f0ede8', color: '#9a9080' }
};

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  'Tier 1': { bg: '#fef7ed', color: '#c47e3a' },
  'Tier 2': { bg: '#eff6ff', color: '#2563eb' },
  'Tier 3': { bg: '#f8f7f4', color: '#9a9080' }
};

export default function CompanyCard({ company, isWatched }: { company: Company; isWatched?: boolean }) {
  const fitKey = fitTone(company.lean_fit_score);
  const fitStyle = FIT_STYLES[fitKey];
  const tierStyle = company.priority_tier ? TIER_STYLES[company.priority_tier] : null;

  return (
    <div style={{ position: 'relative' }}>
      <WatchlistButton companyId={company.id} initialWatched={isWatched ?? false} />
    <Link
      href={`/companies/${company.id}`}
      style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px',
        padding: '16px', textDecoration: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--hover-border)';
        e.currentTarget.style.boxShadow = '0 2px 8px var(--hover-shadow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
          {company.name}
        </h3>
        {company.lean_fit_score != null && (
          <span style={{ ...fitStyle, flexShrink: 0, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
            {company.lean_fit_score}
          </span>
        )}
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {company.sub_sector && (
          <span style={{ background: 'var(--hover-row-bg)', color: 'var(--text-muted)', borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 500 }}>
            {company.sub_sector}
          </span>
        )}
        {company.priority_tier && tierStyle && (
          <span style={{ ...tierStyle, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 500 }}>
            {company.priority_tier}
          </span>
        )}
        {(company.country || company.region) && (
          <span style={{ background: 'var(--hover-row-bg)', color: 'var(--text-muted)', borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 500 }}>
            {company.country || company.region}
          </span>
        )}
      </div>

      {/* Rationale */}
      {company.rationale && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {company.rationale}
        </p>
      )}

      {/* Links */}
      {(company.website_url || company.linkedin_company_url) && (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--hover-row-bg)' }}>
          {company.website_url && (
            <a
              href={company.website_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            >
              <Globe size={11} /> Website
            </a>
          )}
          {company.linkedin_company_url && (
            <a
              href={company.linkedin_company_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            >
              <Linkedin size={11} /> LinkedIn
            </a>
          )}
        </div>
      )}
    </Link>
    </div>
  );
}
