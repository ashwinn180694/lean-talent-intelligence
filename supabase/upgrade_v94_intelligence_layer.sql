-- v9.4 Intelligence Layer: global search support and talent pool membership policies.
create extension if not exists pgcrypto;

create table if not exists public.candidate_pools (
  candidate_id uuid references public.candidates(id) on delete cascade,
  pool_id uuid references public.talent_pools(id) on delete cascade,
  primary key(candidate_id, pool_id)
);

alter table public.candidate_pools enable row level security;

drop policy if exists "Lean users can read candidate pools" on public.candidate_pools;
drop policy if exists "Lean users can manage candidate pools" on public.candidate_pools;

create policy "Lean users can read candidate pools"
on public.candidate_pools
for select
using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can manage candidate pools"
on public.candidate_pools
for all
using (auth.jwt() ->> 'email' like '%@leantech.me')
with check (auth.jwt() ->> 'email' like '%@leantech.me');

-- Keep the candidates view fresh for global search.
drop view if exists public.candidates_view;
create view public.candidates_view as
select c.*, co.name as company_name
from public.candidates c
left join public.companies co on co.id = c.company_id;
