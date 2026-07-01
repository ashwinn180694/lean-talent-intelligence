'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Linkedin, Briefcase, Heart, MapPin, Pencil, Trash2, Users, TrendingUp } from 'lucide-react';
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

function countryFlag(country?: string | null): string {
  if (!country) return '';
  const map: Record<string, string> = {
    'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪',
    'Saudi Arabia': '🇸🇦', 'KSA': '🇸🇦',
    'USA': '🇺🇸', 'United States': '🇺🇸',
    'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
    'Singapore': '🇸🇬',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Switzerland': '🇨🇭',
    'Netherlands': '🇳🇱',
    'Bahrain': '🇧🇭',
    'Egypt': '🇪🇬',
    'Nigeria': '🇳🇬',
    'Kenya': '🇰🇪',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'Hong Kong': '🇭🇰',
    'Israel': '🇮🇱',
    'Turkey': '🇹🇷',
    'Jordan': '🇯🇴',
    'Pakistan': '🇵🇰',
    'Malta': '🇲🇹',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Poland': '🇵🇱',
    'Estonia': '🇪🇪',
    'Lithuania': '🇱🇹',
  };
  return map[country] || '';
}

export default function CompanyDetailClient({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [similar, setSimilar] = useState<Company[]>([]);
  const [categoryPeers, setCategoryPeers] = useState<Company[]>([]);
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
      if (data.sub_sector) {
        const { data: peers } = await supabase
          .from('companies')
          .select('id,name,lean_fit_score,region,headcount_range,funding_stage,hq_country,country,hq,sub_sector,priority_tier')
          .eq('sub_sector', data.sub_sector)
          .order('lean_fit_score', { ascending: false });
        const allPeers = (peers || []) as Company[];
        setCategoryPeers(allPeers);
        setSimilar(allPeers.filter(p => p.id !== companyId).slice(0, 5));
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

  const currentIdx = categoryPeers.findIndex(p => p.id === companyId);
  const prevCompany = currentIdx > 0 ? categoryPeers[currentIdx - 1] : null;
  const nextCompany = currentIdx >= 0 && currentIdx < categoryPeers.length - 1 ? categoryPeers[currentIdx + 1] : null;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (editOpen || e.metaKey || e.ctrlKey || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft' && prevCompany) router.push(`/companies/${prevCompany.id}`);
    if (e.key === 'ArrowRight' && nextCompany) router.push(`/companies/${nextCompany.id}`);
    if (e.key === 'Escape') router.push('/companies');
  }, [prevCompany, nextCompany, editOpen, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

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
      <div style={{ padding: '28px 32px', color: 'var(--text-muted)' }}>
        Company not found.{' '}
        <Link href="/companies" style={{ color: 'var(--green)', textDecoration: 'none' }}>← Back</Link>
      </div>
    );
  }

  const accent = catColor(company.sub_sector);
  const tc = tierColors(company.priority_tier || '');
  const fit = company.lean_fit_score || 0;
  const fc = fitColor(fit);
  const functions = (company.recommended_functions || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
  const flag = countryFlag(company.country || company.hq);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div className="page-enter page-padded" style={{ padding: '24px 32px 40px', maxWidth: '980px' }}>

        {/* Back + Prev/Next */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <Link
            href="/companies"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={14} /> Companies
          </Link>

          {categoryPeers.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {currentIdx >= 0 && (
                <span style={{ fontSize: '11.5px', color: 'var(--text-faint)', marginRight: '6px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {currentIdx + 1} / {categoryPeers.length}
                </span>
              )}
              <Link
                href={prevCompany ? `/companies/${prevCompany.id}` : '#'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '6px', fontSize: '12.5px',
                  background: prevCompany ? 'var(--nav-hover)' : 'transparent',
                  color: prevCompany ? 'var(--text-mid)' : 'var(--text-faint)',
                  border: '1px solid', borderColor: prevCompany ? 'var(--border)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.12s',
                  pointerEvents: prevCompany ? 'auto' : 'none',
                }}
              >
                <ChevronLeft size={13} />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {prevCompany?.name || 'Prev'}
                </span>
              </Link>
              <Link
                href={nextCompany ? `/companies/${nextCompany.id}` : '#'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '6px', fontSize: '12.5px',
                  background: nextCompany ? 'var(--nav-hover)' : 'transparent',
                  color: nextCompany ? 'var(--text-mid)' : 'var(--text-faint)',
                  border: '1px solid', borderColor: nextCompany ? 'var(--border)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.12s',
                  pointerEvents: nextCompany ? 'auto' : 'none',
                }}
              >
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextCompany?.name || 'Next'}
                </span>
                <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
              background: `${accent}20`, border: `1px solid ${accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, fontSize: '22px', fontWeight: 700,
            }}>
              {company.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: '25px', fontWeight: 600, color: 'var(--text-hi)' }}>{company.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {company.sub_sector && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: accent, display: 'inline-block' }} />
                    {company.sub_sector}
                  </span>
                )}
                {(company.country || company.hq) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {flag && <span>{flag}</span>}
                    <MapPin size={12} /> {company.country || company.hq}
                  </span>
                )}
                {company.headcount_range && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} /> {company.headcount_range}
                  </span>
                )}
                {company.funding_stage && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={12} /> {company.funding_stage}
                    {company.total_raised ? ` · ${company.total_raised}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={toggleWatch}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                borderRadius: '7px', padding: '8px 14px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
                background: saved ? 'var(--green-10)' : 'transparent',
                color: saved ? 'var(--green)' : 'var(--text-muted)',
                borderColor: saved ? 'var(--border-accent)' : 'var(--border)',
              }}
            >
              <Heart size={15} fill={saved ? 'var(--green)' : 'none'} />
              {saved ? 'Saved' : 'Watchlist'}
            </button>
            <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
              {company.priority_tier || 'Unranked'}
            </span>
            {fit > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 500, color: fc, lineHeight: 1 }}>{fit.toFixed(1)}</p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--text-faint)' }}>fit score</p>
              </div>
            )}
            <button
              onClick={() => setEditOpen(true)}
              style={{ background: 'var(--nav-hover)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 0 24px' }} />

        {/* Two-column body */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>

          {/* Left */}
          <div>
            {company.description && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</p>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.65', color: 'var(--text-mid)' }}>{company.description}</p>
              </div>
            )}
            {functions.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommended functions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {functions.map(fn => (
                    <span key={fn} style={{
                      borderRadius: '99px', padding: '4px 12px', fontSize: '12.5px',
                      background: 'var(--green-10)', color: 'var(--green)',
                      border: '1px solid var(--border-accent)',
                    }}>{fn}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Enrichment stats row */}
            {(company.headcount_range || company.funding_stage || company.total_raised || company.key_investors || company.founded_year) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '8px' }}>
                {company.founded_year && (
                  <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Founded</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-hi)' }}>{company.founded_year}</p>
                  </div>
                )}
                {company.headcount_range && (
                  <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Headcount</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-hi)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={13} style={{ color: 'var(--green)' }} /> {company.headcount_range}
                    </p>
                  </div>
                )}
                {company.funding_stage && (
                  <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stage</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-hi)' }}>{company.funding_stage}</p>
                  </div>
                )}
                {company.total_raised && (
                  <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total raised</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-hi)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <TrendingUp size={13} style={{ color: 'var(--green)' }} /> {company.total_raised}
                    </p>
                  </div>
                )}
                {company.key_investors && (
                  <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Key investors</p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-mid)' }}>{company.key_investors}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pool details</p>
              {[
                ['Tier', company.priority_tier],
                ['Fit score', fit > 0 ? `${fit.toFixed(1)} / 10` : null],
                ['Category', company.sub_sector],
                ['Region', company.region],
                ['HQ', company.headquarters || company.country || company.hq],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-faint)', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-mid)', textAlign: 'right' }}>
                    {label === 'HQ' && flag ? `${flag} ${value}` : value as string}
                  </span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              {company.website_url && (
                <a href={company.website_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
                  background: 'var(--nav-hover)', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '13px', color: 'var(--text-mid)', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)'; }}
                >
                  <Globe size={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> Website
                </a>
              )}
              {company.linkedin_company_url && (
                <a href={company.linkedin_company_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
                  background: 'var(--nav-hover)', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '13px', color: 'var(--text-mid)', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)'; }}
                >
                  <Linkedin size={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> LinkedIn
                </a>
              )}
              {company.careers_url && (
                <a href={company.careers_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
                  background: 'var(--nav-hover)', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '13px', color: 'var(--text-mid)', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)'; }}
                >
                  <Briefcase size={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> Careers
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Similar pools */}
        {similar.length > 0 && (
          <>
            <div style={{ height: '1px', background: 'var(--border)', margin: '0 0 20px' }} />
            <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-hi)' }}>
              Similar pools in {company.sub_sector}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {similar.map(s => {
                const sfit = s.lean_fit_score || 0;
                const sfc = fitColor(sfit);
                const stc = tierColors(s.priority_tier || '');
                const sAccent = catColor(s.sub_sector);
                const sFlag = countryFlag(s.hq_country || s.country || s.hq);
                const sCountry = s.hq_country || s.country || s.hq || '';
                return (
                  <Link
                    key={s.id}
                    href={`/companies/${s.id}`}
                    className="hover-card"
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '14px 16px', textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    {/* Avatar + fit chip row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                        background: `${sAccent}22`, border: `1px solid ${sAccent}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: sAccent, fontSize: '13px', fontWeight: 700,
                      }}>
                        {(s.name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {s.priority_tier && (
                          <span className="tier-pill" style={{ background: stc.bg, color: stc.color, border: `1px solid ${stc.border}`, fontSize: '10px' }}>
                            {s.priority_tier}
                          </span>
                        )}
                        {sfit > 0 && <span className="fit-chip" style={{ background: `${sfc}20`, color: sfc, fontSize: '11px' }}>{sfit.toFixed(1)}</span>}
                      </div>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)', lineHeight: 1.3 }}>{s.name}</p>
                    {sCountry && (
                      <p style={{ margin: '0 0 4px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {sFlag && <span style={{ marginRight: '3px' }}>{sFlag}</span>}{sCountry}
                      </p>
                    )}
                    {s.headcount_range && (
                      <p style={{ margin: '0 0 4px', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={11} style={{ color: 'var(--text-faint)' }} /> {s.headcount_range}
                      </p>
                    )}
                    {s.funding_stage && (
                      <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={11} style={{ color: 'var(--text-faint)' }} /> {s.funding_stage}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Candidates + Notes */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <CompanyCandidates companyId={company.id} />
          <CompanyNotes companyId={company.id} />
        </div>

        {/* Delete zone */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          {!pendingDelete ? (
            <button
              onClick={() => setPendingDelete(true)}
              style={{ fontSize: '12px', color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, transition: 'color 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            >
              <Trash2 size={13} /> Delete company
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Are you sure?</span>
              <button
                onClick={deleteCompany}
                disabled={deleting}
                style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--red)', color: '#fff', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setPendingDelete(false)}
                style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
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
