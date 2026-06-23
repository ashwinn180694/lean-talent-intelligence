'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Linkedin,
  Briefcase,
  ExternalLink,
  Trash2,
  X,
  Pencil,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import { readCompanyCache, writeCompanyCache, clearCompanyCache } from '@/lib/cache';
import { FIT_COLORS, fitTone, TIER_COLORS } from '@/lib/market';
import type { Company } from '@/lib/types';
import CompanyEditModal from './CompanyEditModal';

export default function CompanyDetailClient({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    const cache = readCompanyCache<Company>();
    const cached = cache?.find(c => c.id === companyId);
    if (cached) { setCompany(cached); setLoading(false); }

    const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
    if (data) {
      setCompany(data as Company);
      const all = readCompanyCache<Company>() || [];
      writeCompanyCache(all.map(c => c.id === companyId ? (data as Company) : c));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [companyId]);

  async function deleteCompany() {
    if (!company) return;
    setDeleting(true);
    setDeleteError('');
    await supabase.from('candidates').update({ company_id: null }).eq('company_id', company.id);
    const { error } = await supabase.from('companies').delete().eq('id', company.id);
    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    clearCompanyCache();
    window.location.href = '/companies';
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-48 animate-pulse rounded" style={{ background: 'var(--border)' }} />
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm hover:underline mb-4" style={{ color: 'var(--brand)' }}>
          <ArrowLeft size={14} /> Back to companies
        </Link>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Company not found.</p>
        </div>
      </div>
    );
  }

  const fitKey = fitTone(company.lean_fit_score);

  const investors = company.key_investors
    ? company.key_investors.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const tags = Array.isArray(company.tags) ? company.tags : [];

  const functions = company.recommended_functions
    ? company.recommended_functions.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="page-enter p-6 space-y-5 max-w-4xl">
      {/* Back */}
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--brand)' }}>
        <ArrowLeft size={14} /> Back to companies
      </Link>

      {/* ── Hero ── */}
      <div className="rounded-2xl px-6 py-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        {/* Name row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {company.name}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {[company.headquarters || company.hq, company.founded_year ? `Founded ${company.founded_year}` : null]
                .filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition"
            style={{
              color: 'var(--brand)',
              border: '1px solid var(--brand)',
              background: 'var(--brand-faint)',
            }}
          >
            <Pencil size={13} /> Edit
          </button>
        </div>

        {/* Funding badge row */}
        {(company.funding_stage || company.total_raised || company.latest_funding_date) && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {company.funding_stage && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--brand-faint)',
                  color: 'var(--brand)',
                  border: '1px solid var(--hover-border)',
                }}
              >
                {company.funding_stage}
              </span>
            )}
            {company.total_raised && (
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {company.total_raised}
              </span>
            )}
            {company.latest_funding_date && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                · {new Date(company.latest_funding_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {company.description && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {company.description}
          </p>
        )}

        {/* 4-column stat grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px mt-6 rounded-xl overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          {[
            { label: 'Headcount', value: company.headcount_range || '—' },
            { label: 'Funding Stage', value: company.funding_stage || '—' },
            { label: 'Total Raised', value: company.total_raised || '—' },
            { label: 'Founded', value: company.founded_year ? String(company.founded_year) : '—' },
          ].map(stat => (
            <div key={stat.label} className="px-4 py-4" style={{ background: 'var(--card-bg)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        {(company.website_url || company.linkedin_url || company.linkedin_company_url || company.careers_url) && (
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            {company.website_url && (
              <a
                href={company.website_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  background: 'var(--page-bg)',
                }}
              >
                <Globe size={12} /> Website <ExternalLink size={10} />
              </a>
            )}
            {(company.linkedin_url || company.linkedin_company_url) && (
              <a
                href={(company.linkedin_url || company.linkedin_company_url)!}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  background: 'var(--page-bg)',
                }}
              >
                <Linkedin size={12} /> LinkedIn <ExternalLink size={10} />
              </a>
            )}
            {company.careers_url && (
              <a
                href={company.careers_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  background: 'var(--page-bg)',
                }}
              >
                <Briefcase size={12} /> Careers <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Key Investors ── */}
      {investors.length > 0 && (
        <div className="rounded-2xl px-6 py-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Key Investors</h2>
          <div className="flex flex-wrap gap-2">
            {investors.map(inv => (
              <span
                key={inv}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--page-bg)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {inv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Tags ── */}
      {tags.length > 0 && (
        <div className="rounded-2xl px-6 py-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--brand-faint)',
                  color: 'var(--brand)',
                  border: '1px solid var(--hover-border)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended Functions ── */}
      {functions.length > 0 && (
        <div className="rounded-2xl px-6 py-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recommended Functions</h2>
          <div className="flex flex-wrap gap-2">
            {functions.map(fn => (
              <span
                key={fn}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--page-bg)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {fn}
              </span>
            ))}
          </div>
          {company.rationale && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {company.rationale}
            </p>
          )}
        </div>
      )}

      {/* ── Priority + Fit ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {company.priority_tier && (
          <div className="rounded-2xl px-6 py-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Priority Tier</p>
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full ${TIER_COLORS[company.priority_tier] ?? ''}`}
            >
              {company.priority_tier}
            </span>
          </div>
        )}
        {company.lean_fit_score != null && (
          <div className="rounded-2xl px-6 py-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Lean Fit Score</p>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${FIT_COLORS[fitKey]}`}>
              {company.lean_fit_score} / 10
            </span>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-1 pb-2">
        {company.last_enriched_at ? (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Last enriched {new Date(company.last_enriched_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        ) : <span />}
        <button
          onClick={() => setPendingDelete(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition"
          style={{ color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)' }}
        >
          <Trash2 size={12} /> Remove company
        </button>
      </div>

      {/* ── Edit Modal ── */}
      {editOpen && (
        <CompanyEditModal
          company={company}
          onClose={() => { setEditOpen(false); load(); }}
        />
      )}

      {/* ── Delete confirm ── */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Remove company?</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Permanently deletes <strong>{company.name}</strong>. Linked candidates will be detached.
                </p>
              </div>
              <button onClick={() => setPendingDelete(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            {deleteError && (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(false)}
                disabled={deleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={deleteCompany}
                disabled={deleting}
                className="btn-danger"
              >
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
