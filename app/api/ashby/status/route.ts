import { NextResponse } from 'next/server';
import { ashbyPost, hasAshbyKey, normalizeAshbyJobs } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  if (!hasAshbyKey()) {
    return NextResponse.json({ success: false, configured: false, error: 'ASHBY_API_KEY is not configured in Netlify.' }, { status: 200 });
  }

  const jobs = await ashbyPost('job.list', { limit: 1, status: ['Open'] });
  if (!jobs.ok) {
    return NextResponse.json({ success: false, configured: true, connected: false, error: jobs.error, details: jobs.data }, { status: 200 });
  }

  return NextResponse.json({
    success: true,
    configured: true,
    connected: true,
    checkedBy: user.email,
    sampleJobs: normalizeAshbyJobs(jobs.data).slice(0, 1),
    message: 'Ashby connection successful.'
  });
}
