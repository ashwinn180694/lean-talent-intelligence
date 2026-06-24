'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Linkedin, Briefcase, Heart, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';
import CompanyEditModal from './CompanyEditModal';
import CompanyNotes from './CompanyNotes';
import CompanyCandidates from './CompanyCandidates';
import TierHistory from './TierHistory';
import FitScoreBreakdown from './FitScoreBreakdown';

const CAT_PALETTE = ['#3DD68C','#46B8D8','#5B5BD6','#D6A35C','#9AB654','#35B979','#F26669'];
const CAT_LIST = ['Neobank','Payments','Lending','Insurance','WealthTech','Crypto / Digital Assets','RegTech','Open Banking','Remittance','Stablecoin','BaaS','BNPL'];

function catColor(cat?: string | null) {
  const i = CAT_LIST.indexOf(cat || '');
  return CAT_PALETTE[i >= 0 ? i % CAT_PALETTE.length : 0];
}

function tierColors(tier: string) {
  if (tier === 'Tier 1') return { color: '#3DD68C', bg: 'rgba(61,214,140,0.12)', border: 'rgba(61,214,140,0.25)' };
  if (tier === 'Tier 2') return { color: '#46B8D8', bg: 'rgba(70,184,216,0.12)', border: 'rgba(70,184,216,0.25)' };
  return { color: '#787F85', bg: 'rgba(120,127,133,0.10)', border: 'rgba(120,127,133,0.20)' };
}

function fitColor(score: number) {
  if (score >= 9) return '#3DD68C';
  if (score >= 8) return '#9AB654';
  if (score >= 7) return '#D6A35C';
  if (score >= 5) return '#787F85';
  return '#F26669';
}

export default function CompanyDetailClient({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [similar, setSimilar] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
    if (data) {
      setCompany(data as Company);
      // Load similar pools in same category
      if (data.sub_sector) {
        const { data: sim } = await supabase
          .from('companies')
          .select('*')
          .eq('sub_sector', data.sub_sector)
          .neq('id', companyId)
          .order('lean_fit_score', { ascending: false })
          .limit(3);
        setSimilar((sim || []) as Company[]);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from('watchlists')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('company_id', companyId)
        .maybeSingle()
        .then(({ data: w }) => setSaved(!!w));
    });
  }, [companyId]);

  async function toggleWatch() {
    if (!userId || !company) return;
    if (saved) {
      await supabase.from('watchlists').delete().eq('user_id', userId).eq('company_id', company.id);
      setSaved(false);
    } else {
      await supabase.from('watchlists').insert({ user_id: userId, company_id: company.id });
      setSaved(true);
    }
  }

  async function deleteCompany() {
    if (!company) return;
    setDeleting(true);
    await supabase.from('companies').delete().eq('id', company.id);
    setDeleting(false);
    window.location.href = '/companies';
  }

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: '980px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: i === 0 ? '28px' : '16px', width: i === 0 ? '200px' : '80%', marginBottom: '14px' }} />
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ padding: '28px 32px', color: '#787F85' }}>
        Company not found.{' '}
        <Link href="/companies" style={{ color: '#3DD68C', textDecoration: 'none' }}>← Back</Link>
      </div>
    );
  }

  const accent = catColor(company.sub_sector);
  const tc = tierColors(company.priority_tier || '');
  const fit = company.lean_fit_score || 0;
  const fc = fitColor(fit);
  const functions = (company.recommended_functions || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div className="page-enter" style={{ padding: '24px 32px 40px', maxWidth: '980px' }}>

        {/* Back */}
        <Link
          href="/companies"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#787F85', textDecoration: 'none', marginBottom: '20px', transition: 'color 0.12s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#EDEEF0')}
          onMouseLeave={e => (e.currentTarget.style.color = '#787F85')}
        >
          <ArrowLeft size={14} /> Back to companies
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
              background: `${accent}20`,
              border: `1px solid ${accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, fontSize: '22px', fontWeight: 700,
            }}>
              {company.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: '25px', fontWeight: 600, color: '#EDEEF0' }}>{company.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#787F85' }}>
                {company.sub_sector && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: accent, display: 'inline-block' }} />
                    {company.sub_sector}
                  </span>
                )}
                {company.region && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {company.region}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={toggleWatch}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                borderRadius: '7px', padding: '8px 14px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
                background: saved ? 'rgba(61,214,140,0.08)' : 'transparent',
                color: saved ? '#3DD68C' : '#787F85',
                borderColor: saved ? 'rgba(61,214,140,0.30)' : 'rgba(255,255,255,0.10)',
              }}
            >
              <Heart size={15} fill={saved ? '#3DD68C' : 'none'} />
              {saved ? 'Saved to watchlist' : 'Add to watchlist'}
            </button>
            <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
              {company.priority_tier || 'Unranked'}
            </span>
            {fit > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 500, color: fc, lineHeight: 1 }}>{fit.toFixed(1)}</p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#5b6066' }}>fit score</p>
              </div>
            )}
            <button
              onClick={() => setEditOpen(true)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '7px', padding: '8px', cursor: 'pointer', color: '#787F85', display: 'flex', transition: 'all 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EDEEF0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#787F85'; }}
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0 24px' }} />

        {/* Two-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>

          {/* Left */}
          <div>
            {company.rationale && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#5b6066', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why this pool</p>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.65', color: '#ADB1B8' }}>{company.rationale}</p>
              </div>
            )}
            {company.description && !company.rationale && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#5b6066', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</p>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.65', color: '#ADB1B8' }}>{company.description}</p>
              </div>
            )}
            {functions.length > 0 && (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: '#5b6066', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommended functions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {functions.map(fn => (
                    <span key={fn} style={{
                      borderRadius: '99px', padding: '4px 12px', fontSize: '12.5px',
                      background: 'rgba(61,214,140,0.10)', color: '#3DD68C',
                      border: '1px solid rgba(61,214,140,0.20)',
                    }}>{fn}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div>
            <div style={{ background: '#212329', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: '#5b6066', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pool details</p>
              {[
                ['Tier', company.priority_tier],
                ['Fit score', fit > 0 ? `${fit.toFixed(1)} / 10` : null],
                ['Category', company.sub_sector],
                ['Region', company.region],
                ['Country', company.country || company.hq],
                ['Founded', company.founded_year?.toString()],
                ['Headcount', company.headcount_range],
                ['Stage', company.funding_stage],
                ['Raised', company.total_raised],
                ['Investors', company.key_investors],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                  <span style={{ fontSize: '12.5px', color: '#5b6066', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: '12.5px', color: '#ADB1B8', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            <FitScoreBreakdown
              companyId={company.id}
              overallFit={fit}
              fitBreakdown={company.fit_breakdown}
              editable
              onSave={async (breakdown) => {
                await supabase.from('companies').update({ fit_breakdown: breakdown }).eq('id', company.id);
                setCompany(c => c ? { ...c, fit_breakdown: breakdown } : c);
              }}
            />
            <TierHistory companyId={company.id} />

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {company.website_url && (
                <a href={company.website_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', fontSize: '13px', color: '#ADB1B8', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)'; (e.currentTarget as HTMLElement).style.color = '#EDEEF0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#ADB1B8'; }}
                >
                  <Globe size={14} style={{ color: '#3DD68C', flexShrink: 0 }} /> Website
                </a>
              )}
              {company.linkedin_company_url && (
                <a href={company.linkedin_company_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', fontSize: '13px', color: '#ADB1B8', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)'; (e.currentTarget as HTMLElement).style.color = '#EDEEF0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#ADB1B8'; }}
                >
                  <Linkedin size={14} style={{ color: '#3DD68C', flexShrink: 0 }} /> LinkedIn
                </a>
              )}
              {company.careers_url && (
                <a href={company.careers_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', fontSize: '13px', color: '#ADB1B8', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)'; (e.currentTarget as HTMLElement).style.color = '#EDEEF0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#ADB1B8'; }}
                >
                  <Briefcase size={14} style={{ color: '#3DD68C', flexShrink: 0 }} /> Careers
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Similar pools */}
        {similar.length > 0 && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0 20px' }} />
            <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: 600, color: '#EDEEF0' }}>
              Similar pools in {company.sub_sector}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {similar.map(s => {
                const sfit = s.lean_fit_score || 0;
                const sfc = fitColor(sfit);
                return (
                  <Link
                    key={s.id}
                    href={`/companies/${s.id}`}
                    className="hover-card"
                    style={{
                      background: '#212329', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px', padding: '14px 16px', textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      {sfit > 0 && <span className="fit-chip" style={{ background: `${sfc}20`, color: sfc, fontSize: '11px' }}>{sfit.toFixed(1)}</span>}
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '13.5px', fontWeight: 600, color: '#EDEEF0' }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#787F85' }}>{s.region || '—'}</p>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Candidates + Notes — two column */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <CompanyCandidates companyId={company.id} />
          <CompanyNotes companyId={company.id} />
        </div>

        {/* Delete zone */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {!pendingDelete ? (
            <button
              onClick={() => setPendingDelete(true)}
              style={{ fontSize: '12px', color: '#5b6066', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, transition: 'color 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F26669')}
              onMouseLeave={e => (e.currentTarget.style.color = '#5b6066')}
            >
              <Trash2 size={13} /> Delete company
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#ADB1B8' }}>Are you sure?</span>
              <button
                onClick={deleteCompany}
                disabled={deleting}
                style={{ padding: '6px 14px', borderRadius: '6px', background: '#F26669', color: '#fff', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setPendingDelete(false)}
                style={{ fontSize: '13px', color: '#787F85', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {editOpen && company && (
        <CompanyEditModal
          company={company}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => { setCompany(updated); setEditOpen(false); }}
        />
      )}
    </div>
  );
}
