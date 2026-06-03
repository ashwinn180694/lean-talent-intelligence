create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text default 'talent_partner',
  created_at timestamptz default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sector text,
  sub_sector text,
  priority_tier text,
  lean_fit_score int check (lean_fit_score between 1 and 10),
  region text,
  country text,
  hq text,
  website_url text,
  linkedin_company_url text,
  careers_url text,
  crunchbase_url text,
  recommended_functions text,
  rationale text,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create table if not exists public.talent_pools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.candidate_pools (
  candidate_id uuid references public.candidates(id) on delete cascade,
  pool_id uuid references public.talent_pools(id) on delete cascade,
  primary key(candidate_id, pool_id)
);

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

create table if not exists public.outreach_activity (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  activity_type text not null,
  status text,
  notes text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create or replace view public.candidates_view as
select c.*, co.name as company_name
from public.candidates c
left join public.companies co on co.id = c.company_id;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  if split_part(new.email, '@', 2) <> 'leantech.me' then
    raise exception 'Only leantech.me emails are allowed';
  end if;
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.candidates enable row level security;
alter table public.talent_pools enable row level security;
alter table public.candidate_pools enable row level security;
alter table public.outreach_activity enable row level security;
alter table public.company_notes enable row level security;
alter table public.activity_feed enable row level security;

create policy "Lean users can read profiles" on public.profiles for select using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Lean users can read companies" on public.companies for select using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can insert companies" on public.companies for insert with check (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can update companies" on public.companies for update using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can read candidates" on public.candidates for select using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can insert candidates" on public.candidates for insert with check (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can update candidates" on public.candidates for update using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can read pools" on public.talent_pools for select using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage pools" on public.talent_pools for all using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage candidate pools" on public.candidate_pools for all using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage outreach" on public.outreach_activity for all using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage company notes" on public.company_notes for all using (auth.jwt() ->> 'email' like '%@leantech.me');
create policy "Lean users can manage activity feed" on public.activity_feed for all using (auth.jwt() ->> 'email' like '%@leantech.me');

insert into public.talent_pools (name, description) values
('Open Banking Product Leaders', 'Product talent from Plaid, Tink, Yapily, TrueLayer, Volt and similar companies'),
('Payments Engineers', 'Engineering talent from payments infrastructure companies'),
('GCC Partnerships Talent', 'Commercial and partnerships leaders across GCC fintech'),
('Banking Infrastructure Talent', 'Talent from core banking, BaaS, and infrastructure platforms')
on conflict (name) do nothing;
