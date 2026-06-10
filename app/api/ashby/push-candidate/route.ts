import { NextResponse } from 'next/server';
import { ashbyPost, normalizeAshbyId } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';
import { getSupabaseForRequest } from '@/lib/supabase-route';

export const dynamic = 'force-dynamic';

type PushBody = {
  candidate: {
    id?: string;
    full_name: string;
    title?: string | null;
    linkedin_url?: string | null;
    location?: string | null;
    notes?: string | null;
    cv_summary?: string | null;
    ashby_candidate_id?: string | null;
  };
  jobId?: string | null;
};

export async function POST(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });
  const supabase = getSupabaseForRequest(request);

  let body: PushBody;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 }); }

  const candidate = body.candidate;
  if (!candidate?.full_name?.trim()) return NextResponse.json({ success: false, error: 'Candidate name is required.' }, { status: 400 });

  let ashbyCandidateId = candidate.ashby_candidate_id || null;
  let createdCandidate = null;

  if (!ashbyCandidateId) {
    const payload: Record<string, any> = { name: candidate.full_name.trim(), createdAt: new Date().toISOString() };
    if (candidate.linkedin_url) payload.linkedInUrl = candidate.linkedin_url;
    const createResult = await ashbyPost('candidate.create', payload);
    if (!createResult.ok) return NextResponse.json({ success: false, step: 'candidate.create', error: createResult.error, details: createResult.data }, { status: 200 });

    createdCandidate = createResult.data;
    ashbyCandidateId = normalizeAshbyId(createResult.data, ['id', 'candidateId']);
    if (!ashbyCandidateId) return NextResponse.json({ success: false, step: 'candidate.create', error: 'Ashby did not return a candidate ID.', details: createResult.data }, { status: 200 });
  }

  const ashbyCandidateRow = {
    id: ashbyCandidateId,
    local_candidate_id: candidate.id || null,
    full_name: candidate.full_name.trim(),
    linkedin_url: candidate.linkedin_url || null,
    current_title: candidate.title || null,
    location: candidate.location || null,
    raw: createdCandidate || {},
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await supabase.from('ashby_candidates').upsert(ashbyCandidateRow, { onConflict: 'id' });

  let ashbyApplicationId = null;
  let createdApplication = null;
  if (body.jobId) {
    const appResult = await ashbyPost('application.create', { candidateId: ashbyCandidateId, jobId: body.jobId });
    if (!appResult.ok) return NextResponse.json({ success: false, step: 'application.create', ashbyCandidateId, error: appResult.error, details: appResult.data }, { status: 200 });
    createdApplication = appResult.data;
    ashbyApplicationId = normalizeAshbyId(appResult.data, ['id', 'applicationId']);

    const { data: job } = await supabase.from('ashby_jobs').select('id,title').eq('id', body.jobId).maybeSingle();
    if (ashbyApplicationId) {
      await supabase.from('ashby_applications').upsert({
        id: ashbyApplicationId,
        ashby_candidate_id: ashbyCandidateId,
        local_candidate_id: candidate.id || null,
        ashby_job_id: body.jobId,
        job_title: job?.title || null,
        candidate_name: candidate.full_name.trim(),
        status: 'Created from Lean',
        source: 'Lean Talent Intelligence',
        raw: createdApplication || {},
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
  }

  await supabase.from('ashby_sync_runs').insert({
    sync_type: 'push_candidate',
    status: 'success',
    records_synced: ashbyApplicationId ? 2 : 1,
    actor_email: user.email,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    raw_response: { ashbyCandidateId, ashbyApplicationId }
  });

  return NextResponse.json({ success: true, ashbyCandidateId, ashbyApplicationId, createdCandidate, createdApplication, pushedBy: user.email });
}
