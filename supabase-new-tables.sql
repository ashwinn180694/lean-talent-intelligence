-- ─────────────────────────────────────────────
-- 0. Add fit_breakdown column to companies
-- ─────────────────────────────────────────────
alter table companies add column if not exists fit_breakdown jsonb default null;

-- ─────────────────────────────────────────────
-- 1. Company Notes (shared across team)
-- ─────────────────────────────────────────────
create table if not exists company_notes (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete set null,
  author_email text,
  content      text not null,
  created_at   timestamptz default now()
);

alter table company_notes enable row level security;

create policy "notes_select" on company_notes
  for select using (auth.role() = 'authenticated');

create policy "notes_insert" on company_notes
  for insert with check (auth.uid() = user_id);

create policy "notes_delete" on company_notes
  for delete using (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 2. Candidates (basic profile, linked to company)
-- ─────────────────────────────────────────────
create table if not exists candidates (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete cascade not null,
  added_by     uuid references auth.users(id) on delete set null,
  name         text not null,
  linkedin_url text,
  current_position text,
  notes        text,
  stage        text not null default 'Identified',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table candidates enable row level security;

create policy "candidates_select" on candidates
  for select using (auth.role() = 'authenticated');

create policy "candidates_insert" on candidates
  for insert with check (auth.uid() = added_by);

create policy "candidates_update" on candidates
  for update using (auth.role() = 'authenticated');

create policy "candidates_delete" on candidates
  for delete using (auth.uid() = added_by);


-- ─────────────────────────────────────────────
-- 3. Tier Change Log
-- ─────────────────────────────────────────────
create table if not exists tier_changes (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete cascade not null,
  changed_by   uuid references auth.users(id) on delete set null,
  changer_email text,
  old_tier     text,
  new_tier     text not null,
  reason       text,
  created_at   timestamptz default now()
);

alter table tier_changes enable row level security;

create policy "tier_changes_select" on tier_changes
  for select using (auth.role() = 'authenticated');

create policy "tier_changes_insert" on tier_changes
  for insert with check (auth.uid() = changed_by);
