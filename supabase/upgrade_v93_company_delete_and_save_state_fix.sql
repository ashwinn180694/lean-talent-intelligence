-- v9.3 Company save/delete state hardening. Safe to run multiple times.
-- Ensures Lean users can read, insert, update, and permanently delete companies,
-- and can detach linked candidates before company deletion.

alter table public.companies enable row level security;
alter table public.candidates enable row level security;

drop policy if exists "Lean users can read companies" on public.companies;
drop policy if exists "Lean users can insert companies" on public.companies;
drop policy if exists "Lean users can update companies" on public.companies;
drop policy if exists "Lean users can delete companies" on public.companies;

create policy "Lean users can read companies"
on public.companies
for select
using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can insert companies"
on public.companies
for insert
with check (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can update companies"
on public.companies
for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can delete companies"
on public.companies
for delete
using (auth.jwt() ->> 'email' like '%@leantech.me');

drop policy if exists "Lean users can update candidates" on public.candidates;

create policy "Lean users can update candidates"
on public.candidates
for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');
