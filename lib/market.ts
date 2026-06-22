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
];

export const PRIMARY_GEOGRAPHIES = ['UAE', 'KSA', 'Global Fintech', 'MENA', 'Europe', 'North America'];
export const PRIORITY_TIERS = ['Tier 1', 'Tier 2', 'Tier 3'];

export function slugify(value: string) {
  return encodeURIComponent(value);
}

export function unslug(value: string) {
  return decodeURIComponent(value);
}

export function categoryClass(category?: string | null) {
  return (category || 'Global Fintech').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function fitTone(score?: number | null) {
  if (!score) return 'neutral';
  if (score >= 8) return 'high';
  if (score >= 5) return 'mid';
  return 'low';
}

export function avgFit(companies: Company[]) {
  const scores = companies.map(c => c.lean_fit_score).filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  if (!scores.length) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export function groupByValue(companies: Company[], getter: (company: Company) => string | null | undefined) {
  const map = new Map<string, Company[]>();
  for (const company of companies) {
    const value = getter(company)?.trim() || 'Unknown';
    if (!map.has(value)) map.set(value, []);
    map.get(value)!.push(company);
  }
  return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

export function topCompanies(companies: Company[], limit = 8) {
  return [...companies].sort((a, b) =>
    (b.lean_fit_score || 0) - (a.lean_fit_score || 0) ||
    (a.priority_tier || '').localeCompare(b.priority_tier || '') ||
    a.name.localeCompare(b.name)
  ).slice(0, limit);
}

export function tierOneCount(companies: Company[]) {
  return companies.filter(c => c.priority_tier === 'Tier 1').length;
}
