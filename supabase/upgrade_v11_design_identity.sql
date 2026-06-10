-- v11 Design + Identity layer: user profiles for display names and ownership context.
create table if not exists public.user_profiles (
  email text primary key,
  display_name text,
  title text,
  team text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Lean users can read profiles" on public.user_profiles;
drop policy if exists "Lean users can create own profile" on public.user_profiles;
drop policy if exists "Lean users can update own profile" on public.user_profiles;

create policy "Lean users can read profiles"
on public.user_profiles
for select
using (auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can create own profile"
on public.user_profiles
for insert
with check (email = auth.jwt() ->> 'email' and auth.jwt() ->> 'email' like '%@leantech.me');

create policy "Lean users can update own profile"
on public.user_profiles
for update
using (email = auth.jwt() ->> 'email' and auth.jwt() ->> 'email' like '%@leantech.me')
with check (email = auth.jwt() ->> 'email' and auth.jwt() ->> 'email' like '%@leantech.me');

insert into public.user_profiles (email, display_name, title, team)
select distinct actor_email,
  initcap(replace(split_part(actor_email, '@', 1), '.', ' ')),
  'Talent Team',
  'Talent'
from public.activity_feed
where actor_email is not null
on conflict (email) do nothing;

insert into public.user_profiles (email, display_name, title, team)
select distinct owner_email,
  initcap(replace(split_part(owner_email, '@', 1), '.', ' ')),
  'Talent Team',
  'Talent'
from public.candidates
where owner_email is not null
on conflict (email) do nothing;
