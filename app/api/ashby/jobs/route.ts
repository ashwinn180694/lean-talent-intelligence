import { NextResponse } from 'next/server';
import { ashbyPost, normalizeAshbyJobs } from '@/lib/ashby';
import { requireLeanUser } from '@/lib/api-auth';
import { getSupabaseForRequest } from '@/lib/supabase-route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  const supabase = getSupabaseForRequest(request);
  const { data, error } = await supabase.from('ashby_jobs').select('*').order('title');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  return NextResponse.json({ success: true, jobs: data || [] });
}

export async function POST(request: Request) {
  const user = await requireLeanUser(request);
  if (!user.ok) return NextResponse.json({ success: false, error: user.error }, { status: user.status });

  const supabase = getSupabaseForRequest(request);
  const startedAt = new Date().toISOString();
  const result = await ashbyPost('job.list', { limit: 100, status: ['Open'] });
  if (!result.ok) {
    await supabase.from('ashby_sync_runs').insert({ sync_type: 'jobs', status: 'failed', records_synced: 0, error_message: result.error, actor_email: user.email, started_at: startedAt, finished_at: new Date().toISOString(), raw_response: result.data || null });
    return NextResponse.json({ success: false, error: result.error, details: result.data }, { status: 200 });
  }

  const jobs = normalizeAshbyJobs(result.data);
  const rows = jobs.map((job: any) => ({ ...job, synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
  if (rows.length) {
    const { error } = await supabase.from('ashby_jobs').upsert(rows, { onConflict: 'id' });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }

  await supabase.from('ashby_sync_runs').insert({ sync_type: 'jobs', status: 'success', records_synced: rows.length, actor_email: user.email, started_at: startedAt, finished_at: new Date().toISOString(), raw_response: { moreDataAvailable: Boolean(result.data?.moreDataAvailable), nextCursor: result.data?.nextCursor || null } });

  return NextResponse.json({ success: true, jobs: rows, count: rows.length, nextCursor: result.data?.nextCursor || null, moreDataAvailable: Boolean(result.data?.moreDataAvailable) });
}
