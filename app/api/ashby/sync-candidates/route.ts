import { NextResponse } from 'next/server';
import { ashbyPost, normalizeAshbyApplications, normalizeAshbyCandidates } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';
import { getSupabaseForRequest } from '@/lib/supabase-route';

export const dynamic = 'force-dynamic';

function candidateRowFromAshby(candidate: any) {
  return {
    id: candidate.id,
    full_name: candidate.full_name,
    email: candidate.email || null,
    phone: candidate.phone || null,
    linkedin_url: candidate.linkedin_url || null,
    current_company: candidate.current_company || null,
    current_title: candidate.current_title || null,
    location: candidate.location || null,
    raw: candidate.raw || null,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function localCandidateFromAshby(candidate: any) {
  return {
    full_name: candidate.full_name || 'Unknown candidate',
    title: candidate.current_title || null,
    location: candidate.location || null,
    linkedin_url: candidate.linkedin_url || null,
    status: 'Ashby Sync',
    notes: candidate.current_company ? `Imported from Ashby. Current company: ${candidate.current_company}` : 'Imported from Ashby.',
    ashby_candidate_id: candidate.id,
    ashby_last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function POST(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  const supabase = getSupabaseForRequest(request);
  const startedAt = new Date().toISOString();

  const [candidateResult, applicationResult] = await Promise.all([
    ashbyPost('candidate.list', { limit: 100 }),
    ashbyPost('application.list', { limit: 100, expand: ['candidate', 'job', 'currentInterviewStage', 'source'] })
  ]);

  if (!candidateResult.ok && !applicationResult.ok) {
    await supabase.from('ashby_sync_runs').insert({ sync_type: 'candidates_applications', status: 'failed', records_synced: 0, error_message: candidateResult.error || applicationResult.error, actor_email: user.email, started_at: startedAt, finished_at: new Date().toISOString(), raw_response: { candidate: candidateResult.data, application: applicationResult.data } });
    return NextResponse.json({ success: false, error: candidateResult.error || applicationResult.error || 'Ashby sync failed.' }, { status: 200 });
  }

  const candidates = candidateResult.ok ? normalizeAshbyCandidates(candidateResult.data) : [];
  const applications = applicationResult.ok ? normalizeAshbyApplications(applicationResult.data) : [];

  const candidateMap = new Map<string, any>();
  for (const candidate of candidates) candidateMap.set(candidate.id, candidate);
  for (const app of applications) {
    if (app.ashby_candidate_id && app.candidate_name && !candidateMap.has(app.ashby_candidate_id)) {
      candidateMap.set(app.ashby_candidate_id, { id: app.ashby_candidate_id, full_name: app.candidate_name, raw: app.raw?.candidate || {} });
    }
  }

  const candidateRows = Array.from(candidateMap.values()).map(candidateRowFromAshby);
  if (candidateRows.length) {
    const { error } = await supabase.from('ashby_candidates').upsert(candidateRows, { onConflict: 'id' });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }

  const { data: existingLocal } = await supabase.from('candidates').select('id, ashby_candidate_id');
  const existingByAshby = new Map((existingLocal || []).filter((c: any) => c.ashby_candidate_id).map((c: any) => [c.ashby_candidate_id, c.id]));

  let localCreated = 0;
  for (const candidate of Array.from(candidateMap.values())) {
    if (!candidate.id || existingByAshby.has(candidate.id)) continue;
    const { data, error } = await supabase.from('candidates').insert(localCandidateFromAshby(candidate)).select('id').single();
    if (!error && data?.id) {
      existingByAshby.set(candidate.id, data.id);
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
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }

  await supabase.from('ashby_sync_runs').insert({ sync_type: 'candidates_applications', status: 'success', records_synced: candidateRows.length + appRows.length, actor_email: user.email, started_at: startedAt, finished_at: new Date().toISOString(), raw_response: { candidates: candidateRows.length, applications: appRows.length, localCreated } });

  return NextResponse.json({ success: true, candidateCount: candidateRows.length, applicationCount: appRows.length, localCandidatesCreated: localCreated });
}
