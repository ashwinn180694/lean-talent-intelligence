'use client';

import Link from 'next/link';
import { ExternalLink, Globe, Linkedin } from 'lucide-react';
import { FIT_COLORS, TIER_COLORS, fitTone } from '@/lib/market';
import type { Company } from '@/lib/types';

export default function CompanyCard({ company }: { company: Company }) {
  const fitKey = fitTone(company.lean_fit_score);

  return (
    <Link
      href={`/companies/${company.id}`}
      className="card p-4 flex flex-col gap-3 hover:border-brand/30 hover:shadow-md transition group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-brand transition leading-snug">
          {company.name}
        </h3>
        {company.lean_fit_score != null && (
          <span className={`badge shrink-0 ${FIT_COLORS[fitKey]}`}>
            {company.lean_fit_score}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5">
        {company.sub_sector && (
          <span className="badge bg-slate-100 text-slate-600">{company.sub_sector}</span>
        )}
        {company.priority_tier && (
          <span className={`badge ${TIER_COLORS[company.priority_tier] ?? 'bg-slate-100 text-slate-600'}`}>
            {company.priority_tier}
          </span>
        )}
        {(company.country || company.region) && (
          <span className="badge bg-slate-100 text-slate-500">
            {company.country || company.region}
          </span>
        )}
      </div>

      {/* Rationale */}
      {company.rationale && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {company.rationale}
        </p>
      )}

      {/* Links */}
      {(company.website_url || company.linkedin_company_url) && (
        <div className="mt-auto flex items-center gap-3 pt-1 border-t border-slate-100">
          {company.website_url && (
            <a
              href={company.website_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand transition"
            >
              <Globe size={12} /> Website
            </a>
          )}
          {company.linkedin_company_url && (
            <a
              href={company.linkedin_company_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand transition"
            >
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
        </div>
      )}
    </Link>
  );
}
