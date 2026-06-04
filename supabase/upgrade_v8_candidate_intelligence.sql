-- v8 Candidate Intelligence: CV upload metadata, career history, applications, skills, timeline, and Ashby-ready fields.
create extension if not exists pgcrypto;

alter table public.candidates add column if not exists cv_summary text;
alter table public.candidates add column if not exists parsed_cv_text text;
alter table public.candidates add column if not exists relationship_score integer default 0;
alter table public.candidates add column if not exists ashby_candidate_id text;
alter table public.candidates add column if not exists ashby_last_synced_at timestamptz;
alter table public.candidates add column if not exists previous_company text;
alter table public.candidates add column if not exists skills text[] default '{}';
alter table public.candidates add column if not exists languages text[] default '{}';
alter table public.candidates add column if not exists education jsonb default '[]'::jsonb;

create table if not exists public.candidate_documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  file_name text not null,
  file_path text,
  file_url text,
  file_type text,
  uploaded_by text,
  created_at timestamptz default now()
);

create table if not exists public.candidate_experience (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  company_name text not null,
  title text,
  start_date text,
  end_date text,
  is_current boolean default false,
  notes text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  role_title text not null,
  status text default 'Mapped',
  source text default 'Talent Intelligence',
  ashby_application_id text,
  applied_at date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.candidate_timeline (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  actor_email text,
  event_type text,
  title text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.candidate_documents enable row level security;
alter table public.candidate_experience enable row level security;
alter table public.candidate_applications enable row level security;
alter table public.candidate_timeline enable row level security;

drop policy if exists "Lean users can manage candidate documents" on public.candidate_documents;
drop policy if exists "Lean users can manage candidate experience" on public.candidate_experience;
drop policy if exists "Lean users can manage candidate applications" on public.candidate_applications;
drop policy if exists "Lean users can manage candidate timeline" on public.candidate_timeline;

create policy "Lean users can manage candidate documents" on public.candidate_documents for all using (auth.jwt() ->> 'email' like '%@leantech.me') with check (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage candidate experience" on public.candidate_experience for all using (auth.jwt() ->> 'email' like '%@leantech.me') with check (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage candidate applications" on public.candidate_applications for all using (auth.jwt() ->> 'email' like '%@leantech.me') with check (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage candidate timeline" on public.candidate_timeline for all using (auth.jwt() ->> 'email' like '%@leantech.me') with check (auth.jwt() ->> 'email' like '%@leantech.me');

-- Storage bucket for CVs. Safe to re-run.
insert into storage.buckets (id, name, public)
values ('candidate-cvs', 'candidate-cvs', false)
on conflict (id) do nothing;

drop policy if exists "Lean users can upload candidate CVs" on storage.objects;
drop policy if exists "Lean users can read candidate CVs" on storage.objects;
drop policy if exists "Lean users can update candidate CVs" on storage.objects;
drop policy if exists "Lean users can delete candidate CVs" on storage.objects;

create policy "Lean users can upload candidate CVs" on storage.objects for insert with check (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can read candidate CVs" on storage.objects for select using (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can update candidate CVs" on storage.objects for update using (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can delete candidate CVs" on storage.objects for delete using (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');

create or replace view public.candidates_view as
select c.*, co.name as company_name
from public.candidates c
left join public.companies co on co.id = c.company_id;
