/**
 * Shared company cache utilities.
 * Single source of truth — import from here, not from component files.
 */

const CACHE_KEY = 'lean_companies_v3';

export function readCompanyCache<T>(): T[] | null {
  try {
    const raw =
      sessionStorage.getItem(CACHE_KEY) ?? localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

export function writeCompanyCache<T>(items: T[]): void {
  try {
    const serialized = JSON.stringify(items);
    sessionStorage.setItem(CACHE_KEY, serialized);
    localStorage.setItem(CACHE_KEY, serialized);
  } catch {}
}

export function clearCompanyCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_KEY);
    // Also clear old v1/v2 keys from the previous build
    for (const old of [
      'lean_cache_companies_current',
      'lean_cache_companies_v1',
      'lean_cache_companies_v2_awesomefintech'
    ]) {
      sessionStorage.removeItem(old);
      localStorage.removeItem(old);
    }
  } catch {}
}
