-- ============================================================
-- Lean Talent Intelligence — Schema Extension
-- Run this in: https://supabase.com/dashboard/project/fechmjopuwnsyfpslwzq/editor
-- ============================================================

-- ── 1. Enrich companies table ────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS description        text,
  ADD COLUMN IF NOT EXISTS founded_year       integer,
  ADD COLUMN IF NOT EXISTS headquarters       text,
  ADD COLUMN IF NOT EXISTS headcount_range    text,       -- e.g. "500–1000"
  ADD COLUMN IF NOT EXISTS funding_stage      text,       -- e.g. "Series C", "Public", "Bootstrapped"
  ADD COLUMN IF NOT EXISTS total_raised       text,       -- e.g. "$250M"
  ADD COLUMN IF NOT EXISTS latest_funding_date text,      -- e.g. "Mar 2024"
  ADD COLUMN IF NOT EXISTS key_investors      text,       -- comma-separated
  ADD COLUMN IF NOT EXISTS website_url        text,
  ADD COLUMN IF NOT EXISTS linkedin_url       text,
  ADD COLUMN IF NOT EXISTS careers_url        text,
  ADD COLUMN IF NOT EXISTS tags               text[],     -- e.g. ARRAY['b2b','api','stablecoin']
  ADD COLUMN IF NOT EXISTS last_enriched_at   timestamptz DEFAULT now();

-- ── 2. Watchlists ─────────────────────────────────────────────
-- Lets users bookmark companies to their personal watchlist

CREATE TABLE IF NOT EXISTS watchlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  uuid NOT NULL REFERENCES companies(id)  ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, company_id)
);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist"
  ON watchlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Company signals ────────────────────────────────────────
-- Funding rounds, news, leadership changes, expansions

CREATE TABLE IF NOT EXISTS company_signals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  signal_type  text NOT NULL CHECK (signal_type IN ('funding','news','leadership','expansion','product','other')),
  title        text NOT NULL,
  summary      text,
  source_url   text,
  signal_date  date,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE company_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read signals"
  ON company_signals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert signals"
  ON company_signals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete signals"
  ON company_signals FOR DELETE
  USING (auth.role() = 'authenticated');

-- ── 4. Company notes ──────────────────────────────────────────
-- Internal notes per company (visible to whole team)

CREATE TABLE IF NOT EXISTS company_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE company_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read notes"
  ON company_notes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notes"
  ON company_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON company_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON company_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ── 5. Indexes ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_watchlists_user    ON watchlists (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_company ON watchlists (company_id);
CREATE INDEX IF NOT EXISTS idx_signals_company    ON company_signals (company_id, signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_notes_company      ON company_notes (company_id, created_at DESC);

-- ── 6. Verify ─────────────────────────────────────────────────

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('description','founded_year','headquarters','headcount_range',
                      'funding_stage','total_raised','key_investors','tags','last_enriched_at')
ORDER BY column_name;
