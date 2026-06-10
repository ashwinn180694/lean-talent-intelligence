import { NextResponse } from 'next/server';
import { ashbyPost, normalizeAshbyJobs } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  const result = await ashbyPost('job.list', { limit: 100, status: ['Open'] });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error, details: result.data }, { status: 200 });

  return NextResponse.json({
    success: true,
    jobs: normalizeAshbyJobs(result.data),
    nextCursor: result.data?.nextCursor || null,
    moreDataAvailable: Boolean(result.data?.moreDataAvailable)
  });
}
