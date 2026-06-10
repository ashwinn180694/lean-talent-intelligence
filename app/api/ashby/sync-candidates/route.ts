import { NextResponse } from 'next/server';
import { applicationBelongsToJob, ashbyPagination, ashbyPost, normalizeAshbyApplications } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';
import { getSupabaseForRequest } from '@/lib/supabase-route';

export const dynamic = 'force-dynamic';

const MAX_JOBS_PER_SYNC = 100;
const MAX_PAGES = 30;

type FetchMode = 'jobId' | 'jobIds' | 'localFilter';

function candidateRowFromApplication(app: any) {
  const rawCandidate = app.raw?.candidate || app.raw?.candidateSnapshot || app.raw?.candidateInfo || {};
  return {
    id: app.ashby_candidate_id,
    full_name: app.candidate_name || rawCandidate.name || rawCandidate.fullName || rawCandidate.displayName || 'Unknown candidate',
    email: rawCandidate.primaryEmailAddress?.value || rawCandidate.email || rawCandidate.emailAddress || null,
    phone: rawCandidate.primaryPhoneNumber?.value || rawCandidate.phone || rawCandidate.phoneNumber || null,
    linkedin_url: rawCandidate.linkedInUrl || rawCandidate.linkedinUrl || rawCandidate.linkedin || rawCandidate.socialLinks?.find?.((link: any) => /linkedin/i.test(String(link?.url || link?.type || '')))?.url || null,
    current_company: rawCandidate.currentCompany || rawCandidate.currentCompanyName || rawCandidate.latestExperience?.companyName || null,
    current_title: rawCandidate.currentTitle || rawCandidate.title || rawCandidate.latestExperience?.title || null,
    location: rawCandidate.location?.name || rawCandidate.location || rawCandidate.currentLocation || null,
    raw: rawCandidate,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function localCandidateFromApplication(app: any) {
  const candidate = candidateRowFromApplication(app);
  return {
    full_name: candidate.full_name || 'Unknown candidate',
    title: candidate.current_title || null,
    location: candidate.location || null,
    linkedin_url: candidate.linkedin_url || null,
    status: app.stage || app.status || 'Ashby Sync',
    notes: app.job_title ? `Imported from Ashby application for ${app.job_title}.` : 'Imported from Ashby live application.',
    ashby_candidate_id: app.ashby_candidate_id,
    ashby_last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function listApplications(bodyBase: Record<string, any>, mode: FetchMode, jobId: string) {
  const applicationsById = new Map<string, any>();
  const diagnostics: any[] = [];
  const errors: string[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const body: Record<string, any> = { limit: 100, ...bodyBase };
    if (cursor) body.cursor = cursor;

    const result = await ashbyPost('application.list', body);
    if (!result.ok) {
      errors.push(`${mode}: ${result.error || 'application.list failed'}`);
      diagnostics.push({ mode, page: page + 1, ok: false, error: result.error, status: result.status, responseShape: result.data ? Object.keys(result.data as any) : [] });
      break;
    }

    const normalized = normalizeAshbyApplications(result.data);
    const filtered = mode === 'localFilter' ? normalized.filter(app => applicationBelongsToJob(app, jobId)) : normalized;
    for (const app of filtered) if (app.id) applicationsById.set(app.id, app);

    const pagination = ashbyPagination(result.data);
    diagnostics.push({ mode, page: page + 1, ok: true, totalReturned: normalized.length, matchedThisJob: filtered.length, moreDataAvailable: pagination.more, hasCursor: Boolean(pagination.cursor), sampleJobIds: normalized.slice(0, 5).map(app => app.ashby_job_id).filter(Boolean) });

    cursor = pagination.cursor || undefined;
    if (!pagination.more || !cursor) break;
  }

  return { applications: Array.from(applicationsById.values()), errors, diagnostics };
}

async function fetchApplicationsForJob(jobId: string) {
  const expand = ['candidate', 'job', 'currentInterviewStage', 'source'];
  const attempts = [
    { mode: 'jobId' as FetchMode, body: { jobId, expand } },
    { mode: 'jobIds' as FetchMode, body: { jobIds: [jobId], expand } },
    { mode: 'localFilter' as FetchMode, body: { expand } }
  ];
  const allDiagnostics: any[] = [];
  const allErrors: string[] = [];

  for (const attempt of attempts) {
    const result = await listApplications(attempt.body, attempt.mode, jobId);
    allDiagnostics.push(...result.diagnostics);
    allErrors.push(...result.errors);
    if (result.applications.length > 0) return { applications: result.applications, errors: allErrors, diagnostics: allDiagnostics, usedMode: attempt.mode };
  }
  return { applications: [], errors: allErrors, diagnostics: allDiagnostics, usedMode: 'none' };
}

export async function POST(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  const supabase = getSupabaseForRequest(request);
  const startedAt = new Date().toISOString();

  const { data: storedJobs, error: jobsError } = await supabase
    .from('ashby_jobs')
    .select('id, title, status, is_archived')
    .eq('is_archived', false)
    .order('title')
    .limit(MAX_JOBS_PER_SYNC);

  if (jobsError) {
    await supabase.from('ashby_sync_runs').insert({ sync_type: 'job_scoped_applications', status: 'failed', records_synced: 0, error_message: jobsError.message, actor_email: user.email, started_at: startedAt, finished_at: new Date().toISOString() });
    return NextResponse.json({ success: false, error: jobsError.message }, { status: 200 });
  }

  const jobs = (storedJobs || []).filter((job: any) => !/archived|closed/i.test(String(job.status || '')));
  if (!jobs.length) return NextResponse.json({ success: false, error: 'No synced live Ashby jobs found. Click Sync jobs first, then sync candidates/applications.' }, { status: 200 });

  const applicationsById = new Map<string, any>();
  const diagnosticsByJob: any[] = [];
  const syncErrors: string[] = [];

  for (const job of jobs) {
    const result = await fetchApplicationsForJob(job.id);
    result.errors.forEach(error => syncErrors.push(`${job.title || job.id}: ${error}`));
    diagnosticsByJob.push({ jobId: job.id, jobTitle: job.title, usedMode: result.usedMode, applications: result.applications.length, diagnostics: result.diagnostics.slice(0, 12) });
    for (const app of result.applications) if (app.id) applicationsById.set(app.id, app);
  }

  const applications = Array.from(applicationsById.values());
  const candidateMap = new Map<string, any>();
  for (const app of applications) if (app.ashby_candidate_id) candidateMap.set(app.ashby_candidate_id, candidateRowFromApplication(app));

  const candidateRows = Array.from(candidateMap.values()).filter(candidate => candidate.id);
  if (candidateRows.length) {
    const { error } = await supabase.from('ashby_candidates').upsert(candidateRows, { onConflict: 'id' });
    if (error) return NextResponse.json({ success: false, error: error.message, diagnosticsByJob }, { status: 200 });
  }

  const { data: existingLocal } = await supabase.from('candidates').select('id, ashby_candidate_id');
  const existingByAshby = new Map((existingLocal || []).filter((candidate: any) => candidate.ashby_candidate_id).map((candidate: any) => [candidate.ashby_candidate_id, candidate.id]));

  let localCreated = 0;
  for (const app of applications) {
    if (!app.ashby_candidate_id || existingByAshby.has(app.ashby_candidate_id)) continue;
    const { data, error } = await supabase.from('candidates').insert(localCandidateFromApplication(app)).select('id').single();
    if (!error && data?.id) {
      existingByAshby.set(app.ashby_candidate_id, data.id);
      localCreated += 1;
    }
  }

  const appRows = applications.map((app: any) => ({
    id: app.id,
    ashby_candidate_id: app.ashby_candidate_id || null,
    local_candidate_id: app.ashby_candidate_id ? existingByAshby.get(app.ashby_candidate_id) || null : null,
    ashby_job_id: app.ashby_job_id || null,
    job_title: app.job_title || null,
    candidate_name: app.candidate_name || null,
    status: app.status || null,
    stage: app.stage || null,
    source: app.source || null,
    applied_at: app.applied_at || null,
    raw: app.raw || null,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  if (appRows.length) {
    const { error } = await supabase.from('ashby_applications').upsert(appRows, { onConflict: 'id' });
    if (error) return NextResponse.json({ success: false, error: error.message, diagnosticsByJob }, { status: 200 });
  }

  await supabase.from('ashby_sync_runs').insert({
    sync_type: 'job_scoped_applications',
    status: syncErrors.length ? 'partial_success' : 'success',
    records_synced: candidateRows.length + appRows.length,
    error_message: syncErrors.length ? syncErrors.slice(0, 5).join(' | ') : null,
    actor_email: user.email,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    raw_response: { jobs_scanned: jobs.length, candidates: candidateRows.length, applications: appRows.length, localCreated, diagnosticsByJob: diagnosticsByJob.slice(0, 20), errors: syncErrors.slice(0, 10) }
  });

  return NextResponse.json({
    success: true,
    scopedToJobs: true,
    jobsScanned: jobs.length,
    candidateCount: candidateRows.length,
    applicationCount: appRows.length,
    localCandidatesCreated: localCreated,
    diagnosticsByJob: diagnosticsByJob.slice(0, 20),
    warnings: syncErrors.slice(0, 5)
  });
}
