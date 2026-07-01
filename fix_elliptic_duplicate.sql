-- ============================================================
-- FIX: Elliptic duplicate key error
-- 
-- The row named 'Elliptic' already exists (correct spelling).
-- The row named 'Ellpitic' (misspelling) is a duplicate.
-- This script deletes the misspelled row.
-- Run this BEFORE re-running enrichment_v3.sql
-- ============================================================

BEGIN;

-- Delete the misspelled duplicate
DELETE FROM companies WHERE name = 'Ellpitic';

-- Also remove the broken rename attempt from enrichment_v3.sql by
-- directly updating the correct Elliptic row
UPDATE companies SET
  headcount_range = '201-500',
  funding_stage = 'Series D',
  total_raised = '$241M',
  headquarters = 'London, United Kingdom',
  hq_country = 'United Kingdom',
  founded_year = 2013,
  linkedin_company_url = 'https://www.linkedin.com/company/ellipticco'
WHERE name = 'Elliptic';

COMMIT;
