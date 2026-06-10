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
    const error = data?.errors?.[0]?.message || data?.error || data?.message || `Ashby request failed (${res.status}).`;
    return { ok: false, status: res.status, data, error };
  }

  return { ok: true, status: res.status, data };
}

export function normalizeAshbyId(data: any, keys: string[] = ['id']) {
  const result = data?.results || data?.result || data?.candidate || data?.application || data;
  for (const key of keys) if (result?.[key]) return result[key];
  return null;
}

function extractRows(data: any, preferredKeys: string[] = []) {
  for (const key of preferredKeys) {
    const value = data?.[key];
    if (Array.isArray(value)) return value;
  }
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.value)) return data.value;
  return [];
}

function firstString(...values: any[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(' ').trim();
      if (joined) return joined;
    }
    if (value && typeof value === 'object') {
      const candidate = value.name || value.title || value.label || value.value || value.displayName;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return '';
}

function firstId(...values: any[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const candidate = value.id || value.value || value.jobId || value.candidateId || value.applicationId;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return null;
}

function pickCandidateName(candidate: any) {
  return firstString(
    candidate?.name,
    candidate?.fullName,
    candidate?.displayName,
    [candidate?.firstName, candidate?.lastName].filter(Boolean),
    candidate?.primaryEmailAddress?.value,
    candidate?.email
  );
}

function pickLinkedIn(candidate: any) {
  const socialLinks = Array.isArray(candidate?.socialLinks) ? candidate.socialLinks : [];
  return firstString(
    socialLinks.find((link: any) => /linkedin/i.test(String(link?.url || link?.type || link?.name || '')))?.url,
    candidate?.linkedInUrl,
    candidate?.linkedinUrl,
    candidate?.linkedin,
    candidate?.socialMediaUrls?.linkedin
  );
}

export function normalizeAshbyJobs(data: any) {
  const jobs = extractRows(data, ['jobs']);
  return jobs.map((job: any) => ({
    id: firstId(job?.id, job?.jobId),
    title: firstString(job?.title, job?.name) || 'Untitled job',
    status: firstString(job?.status, job?.jobStatus) || 'Unknown',
    department: firstString(job?.departmentName, job?.department, job?.department?.name),
    location: firstString(job?.locationName, job?.location, job?.location?.name, job?.primaryLocation?.name),
    employment_type: firstString(job?.employmentType, job?.employmentTypeName),
    is_archived: Boolean(job?.isArchived || job?.archivedAt),
    ashby_url: firstString(job?.ashbyUrl, job?.url, job?.jobUrl),
    raw: job
  })).filter((job: any) => job.id);
}

export function normalizeAshbyCandidates(data: any) {
  const candidates = extractRows(data, ['candidates']);
  return candidates.map((candidate: any) => ({
    id: firstId(candidate?.id, candidate?.candidateId),
    full_name: pickCandidateName(candidate) || 'Unknown candidate',
    email: firstString(candidate?.primaryEmailAddress?.value, candidate?.email, candidate?.emailAddress),
    phone: firstString(candidate?.primaryPhoneNumber?.value, candidate?.phone, candidate?.phoneNumber),
    linkedin_url: pickLinkedIn(candidate),
    current_company: firstString(candidate?.currentCompany, candidate?.currentCompanyName, candidate?.latestExperience?.companyName),
    current_title: firstString(candidate?.currentTitle, candidate?.title, candidate?.latestExperience?.title),
    location: firstString(candidate?.location, candidate?.location?.name, candidate?.currentLocation),
    raw: candidate
  })).filter((candidate: any) => candidate.id);
}

export function normalizeAshbyApplications(data: any) {
  const apps = extractRows(data, ['applications']);
  return apps.map((app: any) => {
    const candidate = app?.candidate || app?.candidateSnapshot || app?.candidateInfo || {};
    const job = app?.job || app?.jobInfo || {};
    const stage = app?.currentInterviewStage || app?.interviewStage || app?.stage || {};
    const candidateId = firstId(app?.candidateId, candidate?.id, candidate?.candidateId);
    const jobId = firstId(app?.jobId, app?.job?.id, app?.job?.jobId, job?.id, job?.jobId);
    return {
      id: firstId(app?.id, app?.applicationId),
      ashby_candidate_id: candidateId,
      ashby_job_id: jobId,
      job_title: firstString(job?.title, job?.name, app?.jobTitle),
      candidate_name: pickCandidateName(candidate) || firstString(app?.candidateName),
      status: firstString(app?.status, app?.applicationStatus) || 'Unknown',
      stage: firstString(stage?.title, stage?.name, app?.currentInterviewStageName, app?.stageName),
      source: firstString(app?.source, app?.source?.title, app?.source?.name),
      applied_at: app?.createdAt || app?.appliedAt || app?.applicationCreatedAt || null,
      raw: app
    };
  }).filter((app: any) => app.id);
}

export function applicationBelongsToJob(app: any, jobId: string) {
  const candidates = [
    app?.ashby_job_id,
    app?.jobId,
    app?.job?.id,
    app?.job?.jobId,
    app?.raw?.jobId,
    app?.raw?.job?.id,
    app?.raw?.job?.jobId,
    app?.raw?.jobInfo?.id,
    app?.raw?.jobInfo?.jobId
  ].filter(Boolean).map((value: any) => String(value));
  return candidates.includes(String(jobId));
}

export function ashbyPagination(data: any) {
  return {
    more: Boolean(data?.moreDataAvailable || data?.hasMore || data?.hasNextPage),
    cursor: data?.nextCursor || data?.nextPageCursor || data?.cursor || data?.nextPageToken || null
  };
}
