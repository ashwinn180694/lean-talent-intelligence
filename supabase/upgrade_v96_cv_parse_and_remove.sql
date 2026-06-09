-- v9.6 CV parsing and removable CVs safety migration.
-- Safe to re-run. Ensures candidate CV documents/storage can be created, read, and removed by Lean users.
create extension if not exists pgcrypto;

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

alter table public.candidate_documents enable row level security;

drop policy if exists "Lean users can manage candidate documents" on public.candidate_documents;
create policy "Lean users can manage candidate documents"
on public.candidate_documents
for all
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

insert into storage.buckets (id, name, public)
values ('candidate-cvs', 'candidate-cvs', false)
on conflict (id) do nothing;

drop policy if exists "Lean users can upload candidate CVs" on storage.objects;
drop policy if exists "Lean users can read candidate CVs" on storage.objects;
drop policy if exists "Lean users can update candidate CVs" on storage.objects;
drop policy if exists "Lean users can delete candidate CVs" on storage.objects;

create policy "Lean users can upload candidate CVs"
on storage.objects for insert
with check (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can read candidate CVs"
on storage.objects for select
using (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can update candidate CVs"
on storage.objects for update
using (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can delete candidate CVs"
on storage.objects for delete
using (bucket_id = 'candidate-cvs' and auth.jwt() ->> 'email' like '%@leantech.me');
