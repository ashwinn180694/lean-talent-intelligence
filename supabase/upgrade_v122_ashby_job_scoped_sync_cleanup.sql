-- v12.2 Ashby job-scoped sync cleanup.
-- Removes broad candidate.list mirrors that are not connected to any synced Ashby application.
-- Safe to run after deploying v12.2.

-- Remove local candidate records that were created by the previous broad Ashby sync
-- but are not linked to any job-scoped Ashby application.
delete from public.candidates c
where c.ashby_candidate_id is not null
  and c.status = 'Ashby Sync'
  and not exists (
    select 1
    from public.ashby_applications aa
    where aa.ashby_candidate_id = c.ashby_candidate_id
  );

-- Remove mirrored Ashby candidates that are not connected to any synced application.
delete from public.ashby_candidates ac
where not exists (
  select 1
  from public.ashby_applications aa
  where aa.ashby_candidate_id = ac.id
);

insert into public.ashby_sync_runs (
  sync_type,
  status,
  records_synced,
  error_message,
  started_at,
  finished_at,
  raw_response
) values (
  'job_scoped_cleanup',
  'success',
  0,
  null,
  now(),
  now(),
  jsonb_build_object('note', 'Removed broad Ashby candidate mirrors not linked to synced applications')
);
