'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-browser';
import type { Company } from '@/lib/types';

// Country positions as cx/cy in a 1000x480 viewBox
const COUNTRY_POSITIONS: Record<string, { cx: number; cy: number }> = {
  'USA':                  { cx: 170, cy: 180 },
  'United States':        { cx: 170, cy: 180 },
  'Canada':               { cx: 160, cy: 130 },
  'Brazil':               { cx: 270, cy: 310 },
  'Colombia':             { cx: 220, cy: 270 },
  'UK':                   { cx: 455, cy: 145 },
  'United Kingdom':       { cx: 455, cy: 145 },
  'France':               { cx: 468, cy: 162 },
  'Germany':              { cx: 490, cy: 148 },
  'Switzerland':          { cx: 485, cy: 158 },
  'Netherlands':          { cx: 478, cy: 138 },
  'Denmark':              { cx: 488, cy: 130 },
  'Luxembourg':           { cx: 478, cy: 150 },
  'Malta':                { cx: 498, cy: 178 },
  'Israel':               { cx: 565, cy: 195 },
  'Turkey':               { cx: 558, cy: 172 },
  'Jordan':               { cx: 568, cy: 198 },
  'Egypt':                { cx: 548, cy: 208 },
  'Bahrain':              { cx: 608, cy: 218 },
  'UAE':                  { cx: 618, cy: 222 },
  'United Arab Emirates': { cx: 618, cy: 222 },
  'Saudi Arabia':         { cx: 598, cy: 228 },
  'KSA':                  { cx: 598, cy: 228 },
  'Pakistan':             { cx: 650, cy: 205 },
  'India':                { cx: 665, cy: 232 },
  'Singapore':            { cx: 748, cy: 282 },
  'Hong Kong':            { cx: 775, cy: 218 },
  'Japan':                { cx: 808, cy: 178 },
  'Australia':            { cx: 795, cy: 348 },
  'Nigeria':              { cx: 492, cy: 268 },
  'Kenya':                { cx: 562, cy: 278 },
  'Seychelles':           { cx: 625, cy: 285 },
  'BVI':                  { cx: 240, cy: 222 },
};

function fitBubbleColor(avg: number): string {
  if (avg >= 8) return 'rgba(61,214,140,0.8)';
  if (avg >= 6) return 'rgba(214,163,92,0.8)';
  return 'rgba(120,127,133,0.6)';
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

type CountryGroup = {
  country: string;
  companies: Company[];
  avgFit: number;
  cx: number;
  cy: number;
};

export default function MapClient() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; country: string; count: number; avgFit: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    supabase
      .from('companies')
      .select('id,name,hq_country,country,hq,lean_fit_score,priority_tier,sub_sector')
      .then(({ data }) => {
        setCompanies((data || []) as Company[]);
        setLoading(false);
      });
  }, []);

  // Group by country
  const groups: CountryGroup[] = [];
  const countryMap = new Map<string, Company[]>();

  for (const c of companies) {
    const raw = c.hq_country || c.country || c.hq || '';
    if (!raw) continue;
    // Try to resolve to a position key
    const resolvedKey = Object.keys(COUNTRY_POSITIONS).find(k =>
      k.toLowerCase() === raw.toLowerCase() || raw.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(raw.toLowerCase())
    ) || raw;
    const existing = countryMap.get(resolvedKey) || [];
    existing.push(c);
    countryMap.set(resolvedKey, existing);
  }

  for (const [country, comps] of countryMap.entries()) {
    const pos = COUNTRY_POSITIONS[country];
    if (!pos) continue;
    const scores = comps.map(c => c.lean_fit_score || 0).filter(s => s > 0);
    const avgFit = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    groups.push({ country, companies: comps, avgFit, cx: pos.cx, cy: pos.cy });
  }

  // Sort groups by count desc for display
  const sortedGroups = [...groups].sort((a, b) => b.companies.length - a.companies.length);

  const maxCount = Math.max(...groups.map(g => g.companies.length), 1);
  const minR = 14;
  const maxR = 36;

  function getRadius(count: number) {
    return minR + ((count / maxCount) * (maxR - minR));
  }

  const selectedGroup = selectedCountry ? groups.find(g => g.country === selectedCountry) : null;

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '28px 32px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <p className="eyebrow" style={{ marginBottom: '4px' }}>Talent Universe</p>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 600, color: 'var(--text-hi)' }}>Talent Map</h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${companies.length} companies across ${groups.length} countries`}
          </p>
        </div>

        {/* Map */}
        <div style={{
          borderRadius: '14px', overflow: 'hidden',
          border: '1px solid var(--border)',
          marginBottom: '24px',
          position: 'relative',
        }}>
          <svg
            ref={svgRef}
            viewBox="0 0 1000 480"
            style={{ width: '100%', display: 'block', userSelect: 'none' }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Background */}
            <rect width="1000" height="480" fill="#161820" />

            {/* Subtle grid */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0" y1={i * 48} x2="1000" y2={i * 48}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 50} y1="0" x2={i * 50} y2="480"
                stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              />
            ))}

            {/* Bubbles */}
            {groups.map(g => {
              const r = getRadius(g.companies.length);
              const fill = fitBubbleColor(g.avgFit);
              const isSelected = selectedCountry === g.country;
              return (
                <g
                  key={g.country}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCountry(prev => prev === g.country ? null : g.country)}
                  onMouseEnter={(e) => {
                    const svgRect = svgRef.current?.getBoundingClientRect();
                    if (!svgRect) return;
                    const scaleX = 1000 / svgRect.width;
                    const scaleY = 480 / svgRect.height;
                    setTooltip({
                      x: g.cx / scaleX,
                      y: (g.cy - r - 10) / scaleY,
                      country: g.country,
                      count: g.companies.length,
                      avgFit: g.avgFit,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle
                    cx={g.cx}
                    cy={g.cy}
                    r={r}
                    fill={fill}
                    stroke={isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={selectedCountry && !isSelected ? 0.45 : 1}
                  />
                  <text
                    x={g.cx}
                    y={g.cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={r > 22 ? '11' : '9'}
                    fill="rgba(255,255,255,0.95)"
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {g.companies.length}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: 'absolute',
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
              background: 'rgba(20,22,28,0.96)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)' }}>{tooltip.country}</p>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'var(--text-muted)' }}>{tooltip.count} {tooltip.count === 1 ? 'company' : 'companies'}</p>
              {tooltip.avgFit > 0 && (
                <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace" }}>
                  avg fit {tooltip.avgFit.toFixed(1)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fit score:</span>
          {[
            { label: '≥ 8 (Strong)', color: 'rgba(61,214,140,0.8)' },
            { label: '≥ 6 (Good)', color: 'rgba(214,163,92,0.8)' },
            { label: '< 6 (Watch)', color: 'rgba(120,127,133,0.6)' },
          ].map(({ label, color }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
          <span style={{ marginLeft: '8px', fontSize: '11.5px', color: 'var(--text-faint)' }}>Bubble size = company count · Click to explore</span>
        </div>

        {/* Selected country companies */}
        {selectedGroup ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-hi)' }}>
                {selectedGroup.country}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {selectedGroup.companies.length} {selectedGroup.companies.length === 1 ? 'company' : 'companies'}
              </span>
              {selectedGroup.avgFit > 0 && (
                <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)' }}>
                  avg fit {selectedGroup.avgFit.toFixed(1)}
                </span>
              )}
              <button
                onClick={() => setSelectedCountry(null)}
                style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Clear ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedGroup.companies
                .slice()
                .sort((a, b) => (b.lean_fit_score || 0) - (a.lean_fit_score || 0))
                .map(c => {
                  const fit = c.lean_fit_score || 0;
                  const fc = fitColor(fit);
                  const tc = tierColors(c.priority_tier || '');
                  return (
                    <Link
                      key={c.id}
                      href={`/companies/${c.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '8px', textDecoration: 'none',
                        transition: 'border-color 0.12s, background 0.12s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                      }}
                    >
                      <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 500, color: 'var(--text-hi)' }}>{c.name}</span>
                      {c.sub_sector && (
                        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{c.sub_sector}</span>
                      )}
                      {c.priority_tier && (
                        <span className="tier-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                          {c.priority_tier}
                        </span>
                      )}
                      {fit > 0 && (
                        <span className="fit-chip" style={{ background: fc.bg, color: fc.color }}>{fit.toFixed(1)}</span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ) : (
          /* Country chip list when nothing selected */
          <div>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              All countries — click a bubble or chip to explore
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sortedGroups.map(g => {
                const fill = fitBubbleColor(g.avgFit);
                return (
                  <button
                    key={g.country}
                    onClick={() => setSelectedCountry(g.country)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '5px 12px', borderRadius: '99px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.12s',
                      fontSize: '12.5px', color: 'var(--text-mid)',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)';
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: fill, display: 'inline-block', flexShrink: 0 }} />
                    {g.country}
                    <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {g.companies.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
