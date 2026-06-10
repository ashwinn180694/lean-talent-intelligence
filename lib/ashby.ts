const ASHBY_BASE_URL = 'https://api.ashbyhq.com';

export type AshbyResponse<T = any> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

export function hasAshbyKey() {
  return Boolean(process.env.ASHBY_API_KEY && process.env.ASHBY_API_KEY.trim());
}

function authHeader() {
  const key = process.env.ASHBY_API_KEY || '';
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
}

export async function ashbyPost<T = any>(endpoint: string, body: Record<string, any> = {}): Promise<AshbyResponse<T>> {
  if (!hasAshbyKey()) {
    return { ok: false, status: 500, error: 'ASHBY_API_KEY is not configured.' };
  }

  const res = await fetch(`${ASHBY_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      accept: 'application/json; version=1',
      'content-type': 'application/json',
      authorization: authHeader()
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  let data: any = null;
  try { data = await res.json(); } catch {}

  if (!res.ok || data?.success === false) {
    return {
      ok: false,
      status: res.status,
      data,
      error: data?.errors?.[0]?.message || data?.error || data?.message || `Ashby request failed (${res.status}).`
    };
  }

  return { ok: true, status: res.status, data };
}

export function normalizeAshbyId(data: any, keys: string[] = ['id']) {
  const result = data?.results || data?.result || data;
  for (const key of keys) {
    if (result?.[key]) return result[key];
  }
  return null;
}

export function normalizeAshbyJobs(data: any) {
  const jobs = data?.results || data?.jobs || [];
  return Array.isArray(jobs) ? jobs.map((job: any) => ({
    id: job.id,
    title: job.title || job.name || 'Untitled job',
    status: job.status || job.jobStatus || 'Unknown',
    department: job.departmentName || job.department?.name || job.department || '',
    location: job.locationName || job.location?.name || job.location || '',
    raw: job
  })).filter((job: any) => job.id) : [];
}
