-- v8.6 Permanent company delete fix. Safe to run multiple times.
-- Allows Lean users to permanently delete company rows from Supabase.

drop policy if exists "Lean users can delete companies" on public.companies;

create policy "Lean users can delete companies"
on public.companies
for delete
using (auth.jwt() ->> 'email' like '%@leantech.me');

-- Ensure candidates can be detached from a deleted company before the company row is deleted.
drop policy if exists "Lean users can update candidates" on public.candidates;

create policy "Lean users can update candidates"
on public.candidates
for update
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');
