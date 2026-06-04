-- Candidate module v4: enables candidate profile editing, deletion, ownership, and CSV imports.
create extension if not exists pgcrypto;

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  company_id uuid references public.companies(id) on delete set null,
  location text,
  country text,
  function_area text,
  seniority text,
  linkedin_url text,
  status text default 'Mapped',
  owner_id uuid references auth.users(id) on delete set null,
  owner_email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.candidates add column if not exists notes text;
alter table public.candidates add column if not exists owner_email text;
alter table public.candidates add column if not exists updated_at timestamptz default now();
alter table public.candidates enable row level security;

drop policy if exists "Lean users can read candidates" on public.candidates;
drop policy if exists "Lean users can insert candidates" on public.candidates;
drop policy if exists "Lean users can update candidates" on public.candidates;
drop policy if exists "Lean users can delete candidates" on public.candidates;

create policy "Lean users can read candidates" on public.candidates for select using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can insert candidates" on public.candidates for insert with check (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can update candidates" on public.candidates for update using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can delete candidates" on public.candidates for delete using (auth.jwt() ->> 'email' like '%@leantech.me');

create or replace view public.candidates_view as
select c.*, co.name as company_name
from public.candidates c
left join public.companies co on co.id = c.company_id;
