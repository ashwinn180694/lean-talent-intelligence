-- v9.2 Company autosave persistence hardening.
-- Ensures Lean users can read/update companies.
alter table public.companies enable row level security;

drop policy if exists "Lean users can read companies" on public.companies;
drop policy if exists "Lean users can update companies" on public.companies;
drop policy if exists "Lean users can insert companies" on public.companies;
drop policy if exists "Lean users can delete companies" on public.companies;

create policy "Lean users can read companies"
on public.companies
for select
using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can update companies"
on public.companies
for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can insert companies"
on public.companies
for insert
with check (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can delete companies"
on public.companies
for delete
using (auth.jwt() ->> 'email' like '%@leantech.me');
