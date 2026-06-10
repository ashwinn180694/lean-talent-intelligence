-- v12.1 Ashby Workspace + persisted jobs/candidates/applications.
-- Safe to re-run.

alter table public.candidates add column if not exists ashby_candidate_id text;
alter table public.candidates add column if not exists ashby_last_synced_at timestamptz;

create table if not exists public.ashby_jobs (
  id text primary key,
  title text not null,
  status text,
  department text,
  location text,
  employment_type text,
  is_archived boolean default false,
  ashby_url text,
  raw jsonb,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ashby_candidates (
  id text primary key,
  local_candidate_id uuid references public.candidates(id) on delete set null,
  full_name text,
  email text,
  phone text,
  linkedin_url text,
  current_company text,
  current_title text,
  location text,
  raw jsonb,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ashby_applications (
  id text primary key,
  ashby_candidate_id text references public.ashby_candidates(id) on delete set null,
  local_candidate_id uuid references public.candidates(id) on delete set null,
  ashby_job_id text references public.ashby_jobs(id) on delete set null,
  job_title text,
  candidate_name text,
  status text,
  stage text,
  source text,
  applied_at timestamptz,
  raw jsonb,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ashby_sync_runs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  status text default 'success',
  records_synced integer default 0,
  error_message text,
  actor_email text,
  started_at timestamptz default now(),
  finished_at timestamptz default now(),
  raw_response jsonb
);

alter table public.ashby_jobs enable row level security;
alter table public.ashby_candidates enable row level security;
alter table public.ashby_applications enable row level security;
alter table public.ashby_sync_runs enable row level security;

-- Jobs
DROP POLICY IF EXISTS "Lean users can read Ashby jobs" ON public.ashby_jobs;
DROP POLICY IF EXISTS "Lean users can insert Ashby jobs" ON public.ashby_jobs;
DROP POLICY IF EXISTS "Lean users can update Ashby jobs" ON public.ashby_jobs;
DROP POLICY IF EXISTS "Lean users can delete Ashby jobs" ON public.ashby_jobs;
CREATE POLICY "Lean users can read Ashby jobs" ON public.ashby_jobs FOR SELECT USING (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can insert Ashby jobs" ON public.ashby_jobs FOR INSERT WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can update Ashby jobs" ON public.ashby_jobs FOR UPDATE USING (auth.jwt() ->> 'email' like '%@leantech.me') WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can delete Ashby jobs" ON public.ashby_jobs FOR DELETE USING (auth.jwt() ->> 'email' like '%@leantech.me');

-- Candidates
DROP POLICY IF EXISTS "Lean users can read Ashby candidates" ON public.ashby_candidates;
DROP POLICY IF EXISTS "Lean users can insert Ashby candidates" ON public.ashby_candidates;
DROP POLICY IF EXISTS "Lean users can update Ashby candidates" ON public.ashby_candidates;
DROP POLICY IF EXISTS "Lean users can delete Ashby candidates" ON public.ashby_candidates;
CREATE POLICY "Lean users can read Ashby candidates" ON public.ashby_candidates FOR SELECT USING (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can insert Ashby candidates" ON public.ashby_candidates FOR INSERT WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can update Ashby candidates" ON public.ashby_candidates FOR UPDATE USING (auth.jwt() ->> 'email' like '%@leantech.me') WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can delete Ashby candidates" ON public.ashby_candidates FOR DELETE USING (auth.jwt() ->> 'email' like '%@leantech.me');

-- Applications
DROP POLICY IF EXISTS "Lean users can read Ashby applications" ON public.ashby_applications;
DROP POLICY IF EXISTS "Lean users can insert Ashby applications" ON public.ashby_applications;
DROP POLICY IF EXISTS "Lean users can update Ashby applications" ON public.ashby_applications;
DROP POLICY IF EXISTS "Lean users can delete Ashby applications" ON public.ashby_applications;
CREATE POLICY "Lean users can read Ashby applications" ON public.ashby_applications FOR SELECT USING (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can insert Ashby applications" ON public.ashby_applications FOR INSERT WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can update Ashby applications" ON public.ashby_applications FOR UPDATE USING (auth.jwt() ->> 'email' like '%@leantech.me') WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can delete Ashby applications" ON public.ashby_applications FOR DELETE USING (auth.jwt() ->> 'email' like '%@leantech.me');

-- Sync runs
DROP POLICY IF EXISTS "Lean users can read Ashby sync runs" ON public.ashby_sync_runs;
DROP POLICY IF EXISTS "Lean users can insert Ashby sync runs" ON public.ashby_sync_runs;
DROP POLICY IF EXISTS "Lean users can update Ashby sync runs" ON public.ashby_sync_runs;
CREATE POLICY "Lean users can read Ashby sync runs" ON public.ashby_sync_runs FOR SELECT USING (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can insert Ashby sync runs" ON public.ashby_sync_runs FOR INSERT WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
CREATE POLICY "Lean users can update Ashby sync runs" ON public.ashby_sync_runs FOR UPDATE USING (auth.jwt() ->> 'email' like '%@leantech.me') WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');

-- Ensure app can update local candidates with Ashby IDs.
DROP POLICY IF EXISTS "Lean users can update candidates" ON public.candidates;
CREATE POLICY "Lean users can update candidates"
ON public.candidates
FOR UPDATE
USING (auth.jwt() ->> 'email' like '%@leantech.me')
WITH CHECK (auth.jwt() ->> 'email' like '%@leantech.me');
