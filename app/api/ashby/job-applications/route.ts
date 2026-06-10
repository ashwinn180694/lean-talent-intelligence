import { NextResponse } from 'next/server';
import { ashbyPost, normalizeAshbyApplications } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';
import { getSupabaseForRequest } from '@/lib/supabase-route';

export const dynamic = 'force-dynamic';
const MAX_PAGES = 25;

function candidateRowFromApplication(app: any) {
  const rawCandidate = app.raw?.candidate || app.raw?.candidateSnapshot || {};
  const linkedIn = rawCandidate.linkedInUrl || rawCandidate.linkedinUrl || rawCandidate.socialLinks?.find?.((link: any) => /linkedin/i.test(link?.url || link?.type || ''))?.url || null;
  return {
    id: app.ashby_candidate_id,
    full_name: app.candidate_name || rawCandidate.name || rawCandidate.fullName || 'Unknown candidate',
    email: rawCandidate.primaryEmailAddress?.value || rawCandidate.email || null,
    phone: rawCandidate.primaryPhoneNumber?.value || rawCandidate.phone || null,
    linkedin_url: linkedIn,
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
    notes: app.job_title ? `Imported from Ashby application for ${app.job_title}.` : 'Imported from Ashby application.',
    ashby_candidate_id: app.ashby_candidate_id,
    ashby_last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function fetchApplicationsForJob(jobId: string) {
  const applicationsById = new Map<string, any>();
  const errors: string[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const body: Record<string, any> = {
      limit: 100,
      jobId,
      expand: ['candidate', 'job', 'currentInterviewStage', 'source']
    };
    if (cursor) body.cursor = cursor;

    const result = await ashbyPost('application.list', body);
    if (!result.ok) {
      errors.push(result.error || `application.list failed for job ${jobId}`);
      break;
    }

    const apps = normalizeAshbyApplications(result.data);
    for (const app of apps) if (app.id) applicationsById.set(app.id, app);

    const more = Boolean((result.data as any)?.moreDataAvailable);
    cursor = (result.data as any)?.nextCursor;
    if (!more || !cursor) break;
  }

  return { applications: Array.from(applicationsById.values()), errors };
}

export async function POST(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  let payload: any = {};
  try { payload = await request.json(); } catch {}
  const jobId = String(payload.jobId || '').trim();
  if (!jobId) return NextResponse.json({ success: false, error: 'Missing Ashby job ID.' }, { status: 400 });

  const supabase = getSupabaseForRequest(request);
  const startedAt = new Date().toISOString();
  const { data: job } = await supabase.from('ashby_jobs').select('*').eq('id', jobId).maybeSingle();

  const { applications, errors } = await fetchApplicationsForJob(jobId);

  const candidateMap = new Map<string, any>();
  for (const app of applications) {
    if (app.ashby_candidate_id) candidateMap.set(app.ashby_candidate_id, candidateRowFromApplication(app));
  }

  const candidateRows = Array.from(candidateMap.values()).filter(candidate => candidate.id);
  if (candidateRows.length) {
    const { error } = await supabase.from('ashby_candidates').upsert(candidateRows, { onConflict: 'id' });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 200 });
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
    ashby_job_id: app.ashby_job_id || jobId,
    job_title: app.job_title || job?.title || null,
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
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }

  await supabase.from('ashby_sync_runs').insert({
    sync_type: 'single_job_applications',
    status: errors.length ? 'partial_success' : 'success',
    records_synced: candidateRows.length + appRows.length,
    error_message: errors.length ? errors.slice(0, 5).join(' | ') : null,
    actor_email: user.email,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    raw_response: { jobId, jobTitle: job?.title, candidates: candidateRows.length, applications: appRows.length, localCreated, errors: errors.slice(0, 10) }
  });

  return NextResponse.json({
    success: true,
    jobId,
    jobTitle: job?.title || null,
    candidateCount: candidateRows.length,
    applicationCount: appRows.length,
    localCandidatesCreated: localCreated,
    warnings: errors.slice(0, 5)
  });
}
