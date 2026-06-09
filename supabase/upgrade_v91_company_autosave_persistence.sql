-- v9.1 Company autosave persistence fix.
-- Safe to run multiple times. Ensures Lean users can update company rows and read back updated rows.

alter table public.companies enable row level security;

drop policy if exists "Lean users can update companies" on public.companies;

create policy "Lean users can update companies"
on public.companies
for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

-- Keep this explicit read policy available for update().select('*') to return the updated row.
drop policy if exists "Lean users can read companies" on public.companies;

create policy "Lean users can read companies"
on public.companies
for select
using (auth.jwt() ->> 'email' like '%@leantech.me');
