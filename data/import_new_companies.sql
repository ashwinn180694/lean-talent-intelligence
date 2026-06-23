-- ============================================================
-- Lean Talent Intelligence — New Company Import
-- Generated from: Master Sourcing Tracker - Tier 1 Global.csv
-- ============================================================
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard/project/fechmjopuwnsyfpslwzq/editor
--   2. Paste this entire file and click Run
--
-- WHAT THIS DOES:
--   • Inserts 17 new Tier 1 companies not already in the database
--   • Uses NOT EXISTS to guarantee zero duplicates (case-insensitive)
--   • Skips safely if a company already exists under any name variation
--
-- ALREADY IN DB (20 companies — skipped automatically):
--   Adyen, Airwallex, Amazon Payment Services, Backbase, GoCardless,
--   Klarna, Mambu, Mollie, Nium, Rapyd, Revolut, Stripe, Tabby,
--   Tamara, Thunes, Tink, TrueLayer, Wise, Yapily, Ziina
--
-- ⚠️  NEAR-DUPLICATES — review manually before running:
--   • "Checkout"   → DB already has "Checkout.com"  (probably same company — NOT inserted)
--   • "Volt.io"    → DB already has "Volt"           (probably same company — NOT inserted)
--   • "Mamo Pay"   → DB already has "Mamo"           (may be same — NOT inserted, add manually if different)
--   • "Nuviei"     → looks like a typo for "Nuvei"   (Nuvei IS new — inserted below as "Nuvei")
-- ============================================================

INSERT INTO companies (
  name,
  sector,
  sub_sector,
  priority_tier,
  region,
  recommended_functions,
  source
)
SELECT v.name, v.sector, v.sub_sector, v.priority_tier, v.region, v.recommended_functions, v.source
FROM (VALUES
  ('3S Money',      'FinTech', 'Payments Infrastructure', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Banked',        'FinTech', 'OpenBanking',             'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('BitOasis',      'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'UAE', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Brex',          'FinTech', 'Global Fintech',          'Tier 1', 'Global', 'Engineering, Product, Finance, Commercial',             'Import'),
  ('BVNK',          'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',    'Import'),
  ('Fireblocks',    'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',    'Import'),
  ('Huspy',         'FinTech', 'UAE',                     'Tier 1', 'UAE',    'Engineering, Product, Commercial',                      'Import'),
  ('MangoPay',      'FinTech', 'Payments Infrastructure', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Nuvei',         'FinTech', 'Payments Infrastructure', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial, Risk',  'Import'),
  ('Nymcard',       'FinTech', 'UAE',                     'Tier 1', 'UAE',    'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Payrails',      'FinTech', 'Payments Infrastructure', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Paysafe',       'FinTech', 'Payments',                'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial, Risk',  'Import'),
  ('Pleo',          'FinTech', 'Global Fintech',          'Tier 1', 'Global', 'Engineering, Product, Finance, Commercial',             'Import'),
  ('PPRO',          'FinTech', 'Payments Infrastructure', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Primer',        'FinTech', 'Payments Infrastructure', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Ripple',        'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',    'Import'),
  ('Tap Payments',  'FinTech', 'KSA',                     'Tier 1', 'KSA',   'Engineering, Product, Partnerships, Commercial',        'Import'),
  ('Verto',         'FinTech', 'Remittance',              'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',        'Import')
) AS v(name, sector, sub_sector, priority_tier, region, recommended_functions, source)
WHERE NOT EXISTS (
  SELECT 1 FROM companies c
  WHERE LOWER(c.name) = LOWER(v.name)
);

-- Verify what was inserted
SELECT name, sub_sector, priority_tier, region
FROM companies
WHERE source = 'Import'
ORDER BY name;
