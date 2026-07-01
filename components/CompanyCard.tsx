'use client';

import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

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
  if (score >= 9) return { color: '#3DD68C', bg: 'rgba(61,214,140,0.13)' };
  if (score >= 8) return { color: '#9AB654', bg: 'rgba(154,182,84,0.13)' };
  if (score >= 7) return { color: '#D6A35C', bg: 'rgba(214,163,92,0.13)' };
  if (score >= 5) return { color: '#787F85', bg: 'rgba(120,127,133,0.13)' };
  return { color: '#F26669', bg: 'rgba(242,102,105,0.13)' };
}

export default function CompanyCard({ company, initialWatched }: { company: Company; initialWatched?: boolean; isWatched?: boolean }) {
  const accent = catColor(company.sub_sector);
  const fit = company.lean_fit_score || 0;
  const fc = fitColor(fit);
  const tc = company.priority_tier ? tierColors(company.priority_tier) : null;
  const [watched, setWatched] = useState(initialWatched ?? false);
  const [saving, setSaving] = useState(false);

  async function toggleWatch(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    setWatched(w => !w);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWatched(w => !w); setSaving(false); return; }
    if (!watched) {
      const { error } = await supabase.from('watchlists').insert({ user_id: user.id, company_id: company.id });
      if (error) setWatched(w => !w);
    } else {
      const { error } = await supabase.from('watchlists').delete().eq('user_id', user.id).eq('company_id', company.id);
      if (error) setWatched(w => !w);
    }
    setSaving(false);
  }

  return (
    <Link
      href={`/companies/${company.id}`}
      className="hover-card"
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '11px',
        textDecoration: 'none',
        overflow: 'hidden',
        position: 'relative',
        ['--card-accent' as any]: `${accent}55`,
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: '3px', background: accent, flexShrink: 0 }} />

      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: 3, right: 0, width: '70px', height: '70px',
        pointerEvents: 'none',
        background: `radial-gradient(circle at top right, ${accent}20, transparent 68%)`,
      }} />

      <div style={{ padding: '14px 15px 15px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

        {/* Header row: name + heart */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--text-hi)', lineHeight: 1.35, flex: 1, minWidth: 0 }}>
            {company.name}
          </p>
          <button
            onClick={toggleWatch}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              display: 'flex', flexShrink: 0, color: watched ? '#3DD68C' : '#3a3d43',
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => { if (!watched) (e.currentTarget as HTMLElement).style.color = '#3DD68C'; }}
            onMouseLeave={e => { if (!watched) (e.currentTarget as HTMLElement).style.color = '#3a3d43'; }}
            title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Heart size={14} fill={watched ? '#3DD68C' : 'none'} />
          </button>
        </div>

        {/* Fit + Tier row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {fit > 0 && (
            <span className="fit-chip" style={{ background: fc.bg, color: fc.color, fontSize: '11px' }}>
              {fit.toFixed(1)}
            </span>
          )}
          {company.priority_tier && tc && (
            <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontSize: '10.5px' }}>
              {company.priority_tier}
            </span>
          )}
        </div>

        {/* Region */}
        {(company.region || company.country) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
            <MapPin size={11} style={{ color: '#5b6066', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#5b6066' }}>{company.country || company.region}</span>
          </div>
        )}

        {/* Rationale snippet */}
        {company.rationale && (
          <p style={{
            margin: 0, fontSize: '11.5px', color: '#787F85', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {company.rationale}
          </p>
        )}
      </div>
    </Link>
  );
}
