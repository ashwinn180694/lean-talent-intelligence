import type { Company } from './types';

export const MARKET_CATEGORIES = [
  'Payments',
  'Remittance',
  'Lending',
  'Trading, Crypto & Investing',
  'Payments Infrastructure',
  'OpenBanking',
  'KSA',
  'UAE',
  'Global Fintech',
  'Big Tech'
] as const;

export type MarketCategory = (typeof MARKET_CATEGORIES)[number];

export const PRIORITY_TIERS = ['Tier 1', 'Tier 2', 'Tier 3'] as const;

// ── Slug helpers ────────────────────────────────────────────────────────────
export const slugify = (value: string) => encodeURIComponent(value);
export const unslug = (value: string) => decodeURIComponent(value);

// ── CSS / colour helpers (single source of truth) ───────────────────────────
export function categoryClass(category?: string | null): string {
  return (category || 'global-fintech').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function fitTone(score?: number | null): 'high' | 'mid' | 'low' | 'neutral' {
  if (!score) return 'neutral';
  if (score >= 8) return 'high';
  if (score >= 5) return 'mid';
  return 'low';
}

export const FIT_COLORS: Record<string, string> = {
  high: 'bg-emerald-100 text-emerald-800',
  mid: 'bg-amber-100 text-amber-800',
  low: 'bg-red-100 text-red-800',
  neutral: 'bg-slate-100 text-slate-500'
};

export const TIER_COLORS: Record<string, string> = {
  'Tier 1': 'bg-violet-100 text-violet-800',
  'Tier 2': 'bg-blue-100 text-blue-800',
  'Tier 3': 'bg-slate-100 text-slate-600'
};

// ── Aggregation helpers ──────────────────────────────────────────────────────
export function avgFit(companies: Company[]): number {
  const scores = companies
    .map(c => c.lean_fit_score)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  if (!scores.length) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export function tierOneCount(companies: Company[]): number {
  return companies.filter(c => c.priority_tier === 'Tier 1').length;
}

export function topCompanies(companies: Company[], limit = 8): Company[] {
  return [...companies]
    .sort(
      (a, b) =>
        (b.lean_fit_score || 0) - (a.lean_fit_score || 0) ||
        (a.priority_tier || '').localeCompare(b.priority_tier || '') ||
        a.name.localeCompare(b.name)
    )
    .slice(0, limit);
}

export function groupByValue<T>(
  items: T[],
  getter: (item: T) => string | null | undefined
): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = getter(item)?.trim() || 'Unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  );
}

export function cleanUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
