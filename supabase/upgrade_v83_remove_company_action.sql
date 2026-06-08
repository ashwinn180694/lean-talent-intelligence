-- v8.3 Remove Company action: allow Lean users to delete companies from the UI.
-- Safe to run multiple times.

drop policy if exists "Lean users can delete companies" on public.companies;

create policy "Lean users can delete companies"
on public.companies
for delete
using (auth.jwt() ->> 'email' like '%@leantech.me');
