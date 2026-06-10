-- v12 Ashby Integration Phase 1
-- Safe to re-run. Adds local tracking fields and ensures Lean users can update Ashby IDs.

alter table public.candidates add column if not exists ashby_candidate_id text;
alter table public.candidates add column if not exists ashby_last_synced_at timestamptz;

create table if not exists public.ashby_sync_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete set null,
  actor_email text,
  action text not null,
  ashby_candidate_id text,
  ashby_application_id text,
  ashby_job_id text,
  status text default 'success',
  error_message text,
  raw_response jsonb,
  created_at timestamptz default now()
);

alter table public.ashby_sync_events enable row level security;

drop policy if exists "Lean users can manage Ashby sync events" on public.ashby_sync_events;
create policy "Lean users can manage Ashby sync events"
on public.ashby_sync_events
for all
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

drop policy if exists "Lean users can update candidates" on public.candidates;
create policy "Lean users can update candidates"
on public.candidates
for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');
