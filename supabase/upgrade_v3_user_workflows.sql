create extension if not exists pgcrypto;

create table if not exists public.company_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  note text not null,
  owner_email text,
  created_at timestamptz default now()
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,
  entity_type text,
  entity_name text,
  created_at timestamptz default now()
);

alter table public.company_notes enable row level security;
alter table public.activity_feed enable row level security;

drop policy if exists "Lean users can manage company notes" on public.company_notes;
create policy "Lean users can manage company notes" on public.company_notes
for all using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

drop policy if exists "Lean users can manage activity feed" on public.activity_feed;
create policy "Lean users can manage activity feed" on public.activity_feed
for all using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

alter table public.candidates add column if not exists notes text;
alter table public.candidates add column if not exists owner_email text;
alter table public.candidates add column if not exists updated_at timestamptz default now();
