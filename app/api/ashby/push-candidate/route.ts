import { NextResponse } from 'next/server';
import { ashbyPost, normalizeAshbyId } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

type PushBody = {
  candidate: {
    id?: string;
    full_name: string;
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

  let body: PushBody;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 }); }

  const candidate = body.candidate;
  if (!candidate?.full_name?.trim()) return NextResponse.json({ success: false, error: 'Candidate name is required.' }, { status: 400 });

  let ashbyCandidateId = candidate.ashby_candidate_id || null;
  let createdCandidate = null;

  if (!ashbyCandidateId) {
    const payload: Record<string, any> = {
      name: candidate.full_name.trim(),
      createdAt: new Date().toISOString()
    };
    if (candidate.linkedin_url) payload.linkedInUrl = candidate.linkedin_url;
    const createResult = await ashbyPost('candidate.create', payload);
    if (!createResult.ok) return NextResponse.json({ success: false, step: 'candidate.create', error: createResult.error, details: createResult.data }, { status: 200 });

    createdCandidate = createResult.data;
    ashbyCandidateId = normalizeAshbyId(createResult.data, ['id', 'candidateId']);
    if (!ashbyCandidateId) return NextResponse.json({ success: false, step: 'candidate.create', error: 'Ashby did not return a candidate ID.', details: createResult.data }, { status: 200 });
  }

  let ashbyApplicationId = null;
  let createdApplication = null;
  if (body.jobId) {
    const appResult = await ashbyPost('application.create', { candidateId: ashbyCandidateId, jobId: body.jobId });
    if (!appResult.ok) return NextResponse.json({ success: false, step: 'application.create', ashbyCandidateId, error: appResult.error, details: appResult.data }, { status: 200 });
    createdApplication = appResult.data;
    ashbyApplicationId = normalizeAshbyId(appResult.data, ['id', 'applicationId']);
  }

  return NextResponse.json({
    success: true,
    ashbyCandidateId,
    ashbyApplicationId,
    createdCandidate,
    createdApplication,
    pushedBy: user.email
  });
}
