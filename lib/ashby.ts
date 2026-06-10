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
  if (!hasAshbyKey()) return { ok: false, status: 500, error: 'ASHBY_API_KEY is not configured.' };

  const res = await fetch(`${ASHBY_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { accept: 'application/json; version=1', 'content-type': 'application/json', authorization: authHeader() },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  let data: any = null;
  try { data = await res.json(); } catch {}

  if (!res.ok || data?.success === false) {
    return { ok: false, status: res.status, data, error: data?.errors?.[0]?.message || data?.error || data?.message || `Ashby request failed (${res.status}).` };
  }

  return { ok: true, status: res.status, data };
}

export function normalizeAshbyId(data: any, keys: string[] = ['id']) {
  const result = data?.results || data?.result || data;
  for (const key of keys) if (result?.[key]) return result[key];
  return null;
}

function firstString(...values: any[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const candidate = value.name || value.title || value.label || value.value;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return '';
}

function pickCandidateName(candidate: any) {
  return firstString(candidate?.name, candidate?.fullName, [candidate?.firstName, candidate?.lastName].filter(Boolean).join(' '), candidate?.primaryEmailAddress?.value);
}

export function normalizeAshbyJobs(data: any) {
  const jobs = data?.results || data?.jobs || [];
  return Array.isArray(jobs) ? jobs.map((job: any) => ({
    id: job.id,
    title: firstString(job.title, job.name) || 'Untitled job',
    status: firstString(job.status, job.jobStatus) || 'Unknown',
    department: firstString(job.departmentName, job.department, job.department?.name),
    location: firstString(job.locationName, job.location, job.location?.name, job.primaryLocation?.name),
    employment_type: firstString(job.employmentType, job.employmentTypeName),
    is_archived: Boolean(job.isArchived || job.archivedAt),
    ashby_url: firstString(job.ashbyUrl, job.url, job.jobUrl),
    raw: job
  })).filter((job: any) => job.id) : [];
}

export function normalizeAshbyCandidates(data: any) {
  const candidates = data?.results || data?.candidates || [];
  return Array.isArray(candidates) ? candidates.map((candidate: any) => ({
    id: candidate.id,
    full_name: pickCandidateName(candidate) || 'Unknown candidate',
    email: firstString(candidate.primaryEmailAddress?.value, candidate.email, candidate.emailAddress),
    phone: firstString(candidate.primaryPhoneNumber?.value, candidate.phone, candidate.phoneNumber),
    linkedin_url: firstString(candidate.socialLinks?.find?.((l: any) => /linkedin/i.test(l.type || l.url || ''))?.url, candidate.linkedInUrl, candidate.linkedinUrl),
    current_company: firstString(candidate.currentCompany, candidate.currentCompanyName, candidate.latestExperience?.companyName),
    current_title: firstString(candidate.currentTitle, candidate.title, candidate.latestExperience?.title),
    location: firstString(candidate.location, candidate.location?.name, candidate.currentLocation),
    raw: candidate
  })).filter((candidate: any) => candidate.id) : [];
}

export function normalizeAshbyApplications(data: any) {
  const apps = data?.results || data?.applications || [];
  return Array.isArray(apps) ? apps.map((app: any) => {
    const candidate = app.candidate || app.candidateSnapshot || {};
    const job = app.job || {};
    const stage = app.currentInterviewStage || app.interviewStage || app.stage || {};
    return {
      id: app.id,
      ashby_candidate_id: app.candidateId || candidate.id,
      ashby_job_id: app.jobId || job.id,
      job_title: firstString(job.title, job.name, app.jobTitle),
      candidate_name: pickCandidateName(candidate) || firstString(app.candidateName),
      status: firstString(app.status, app.applicationStatus) || 'Unknown',
      stage: firstString(stage.title, stage.name, app.currentInterviewStageName),
      source: firstString(app.source, app.source?.title, app.source?.name),
      applied_at: app.createdAt || app.appliedAt || null,
      raw: app
    };
  }).filter((app: any) => app.id) : [];
}
