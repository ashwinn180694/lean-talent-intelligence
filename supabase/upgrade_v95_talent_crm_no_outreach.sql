-- v9.5 Talent CRM-lite without outreach log.
-- Adds relationship management fields, follow-up dates, and refreshes candidates_view.

alter table public.candidates add column if not exists relationship_notes text;
alter table public.candidates add column if not exists last_interaction_at date;
alter table public.candidates add column if not exists next_follow_up_at date;
alter table public.candidates add column if not exists warmth_level text default 'Neutral';

-- Make sure Lean users can update candidate CRM fields.
alter table public.candidates enable row level security;

drop policy if exists "Lean users can read candidates" on public.candidates;
drop policy if exists "Lean users can insert candidates" on public.candidates;
drop policy if exists "Lean users can update candidates" on public.candidates;
drop policy if exists "Lean users can delete candidates" on public.candidates;

create policy "Lean users can read candidates"
on public.candidates for select
using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can insert candidates"
on public.candidates for insert
with check (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can update candidates"
on public.candidates for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can delete candidates"
on public.candidates for delete
using (auth.jwt() ->> 'email' like '%@leantech.me');

-- Refresh the view so the newly added CRM fields appear in candidates_view.
drop view if exists public.candidates_view;

create view public.candidates_view as
select c.*, co.name as company_name
from public.candidates c
left join public.companies co on co.id = c.company_id;
