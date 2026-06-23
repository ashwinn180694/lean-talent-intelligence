-- ============================================================
-- Lean Talent Intelligence — Full Multi-Tab Import
-- Source: Master Sourcing Tracker.xlsx (all tabs)
-- ============================================================
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard/project/fechmjopuwnsyfpslwzq/editor
--   2. Paste this entire file and click Run
--
-- WHAT THIS DOES:
--   • Inserts ~100 companies from UAE, KSA, OpenBanking, Remittance tabs
--   • Uses NOT EXISTS (case-insensitive) — 100% safe to re-run
--
-- SKIPPED (near-duplicates / already in DB):
--   Checkout      → Checkout.com in DB
--   Volt.io       → Volt in DB
--   Mamo Pay      → Mamo in DB
--   MamoPay       → Mamo in DB
--   Nuviei        → already inserted as Nuvei
--   BitOasis      → already inserted in previous batch
--   Careem        → ride-hailing, not fintech
-- ============================================================

INSERT INTO companies (name, sector, sub_sector, priority_tier, region, recommended_functions, source)
SELECT v.name, v.sector, v.sub_sector, v.priority_tier, v.region, v.recommended_functions, v.source
FROM (VALUES

  -- ── UAE Tab ───────────────────────────────────────────────
  ('Al Futtaim Finance',    'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Bankiom',               'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Baraka',                'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Binance',               'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Botim',                 'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Bybit',                 'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Compliance, Commercial',         'Import'),
  ('CoinMena',              'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Coinmama',              'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Credable',              'FinTech', 'Lending',                     'Tier 2', 'UAE',    'Engineering, Product, Risk, Commercial',               'Import'),
  ('Crypto.com',            'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Equiti',                'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Fasset',                'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Fuze',                  'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Holo',                  'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Hubpay',                'FinTech', 'Remittance',                  'Tier 2', 'UAE',    'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Hyperpay',              'FinTech', 'Payments',                    'Tier 2', 'UAE',    'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Kraken',                'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('M2',                    'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Compliance, Commercial',         'Import'),
  ('MNT Halan',             'FinTech', 'Lending',                     'Tier 2', 'UAE',    'Engineering, Product, Risk, Commercial',               'Import'),
  ('Multibank',             'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Network International', 'FinTech', 'Payments Infrastructure',    'Tier 1', 'UAE',    'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Now Money',             'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('OKX',                   'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Pay10',                 'FinTech', 'Payments',                    'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Paymob',                'FinTech', 'Payments',                    'Tier 2', 'UAE',    'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Paysend',               'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Pemo',                  'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Plus500',               'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Pluto',                 'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Postpay',               'FinTech', 'Payments',                    'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Prypco',                'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Qashio',                'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Rain',                  'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Sarwa',                 'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Stake',                 'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Stashaway',             'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Temenos',               'FinTech', 'Global Fintech',              'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Thndr',                 'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Tiqmo',                 'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Verity',                'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Wio',                   'FinTech', 'UAE',                         'Tier 1', 'UAE',    'Engineering, Product, Commercial',                     'Import'),
  ('Zand',                  'FinTech', 'UAE',                         'Tier 2', 'UAE',    'Engineering, Product, Commercial',                     'Import'),

  -- ── KSA Tab ───────────────────────────────────────────────
  ('alinma',                'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('alinma pay',            'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Amlak International',   'FinTech', 'Lending',                     'Tier 2', 'KSA',   'Engineering, Product, Risk, Commercial',               'Import'),
  ('Bijal',                 'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Buildnow',              'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Ekar',                  'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Elm',                   'FinTech', 'KSA',                         'Tier 1', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('enjaz',                 'FinTech', 'Remittance',                  'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('FOODICS',               'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Foodics Pay',           'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('friendi pay',           'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Hala',                  'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Jahez',                 'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Lendo',                 'FinTech', 'Lending',                     'Tier 2', 'KSA',   'Engineering, Product, Risk, Commercial',               'Import'),
  ('Lucidya',               'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('madfu',                 'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Mobily',                'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('MoneyGram',             'FinTech', 'Remittance',                  'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Mozn',                  'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('myatooorah',            'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Neoleap',               'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Payfabs',               'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('rab',                   'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('salla',                 'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('sarie',                 'FinTech', 'Payments Infrastructure',    'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Sary',                  'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('SiFi',                  'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('STC pay',               'FinTech', 'Payments',                    'Tier 1', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Tahweel Al Rajhi',      'FinTech', 'Remittance',                  'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Tamam',                 'FinTech', 'Lending',                     'Tier 2', 'KSA',   'Engineering, Product, Risk, Commercial',               'Import'),
  ('Tap',                   'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Telr',                  'FinTech', 'Payments',                    'Tier 2', 'KSA',   'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('urpay',                 'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),
  ('Western Union',         'FinTech', 'Remittance',                  'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('zid',                   'FinTech', 'KSA',                         'Tier 2', 'KSA',   'Engineering, Product, Commercial',                     'Import'),

  -- ── OpenBanking Tab ───────────────────────────────────────
  ('Bankable',              'FinTech', 'OpenBanking',                 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('NeoTek',                'FinTech', 'OpenBanking',                 'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Plaid',                 'FinTech', 'OpenBanking',                 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Salt Edge',             'FinTech', 'OpenBanking',                 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Single View',           'FinTech', 'OpenBanking',                 'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Spare',                 'FinTech', 'OpenBanking',                 'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Trustly',               'FinTech', 'OpenBanking',                 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),

  -- ── Remittance Tab ────────────────────────────────────────
  ('Alchemy Pay',           'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Aquanow',               'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Arf',                   'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('BitPay',                'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Circle',                'FinTech', 'Trading, Crypto & Investing', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('HarpFi',                'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Moonpay',               'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('NOAH',                  'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('OpenPayd',              'FinTech', 'Payments Infrastructure',    'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Rafiki',                'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Slingmoney',            'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Sokin',                 'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Commercial',                     'Import'),
  ('Tazapay',               'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Transak',               'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import'),
  ('Yellowcard',            'FinTech', 'Remittance',                  'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('Zepz',                  'FinTech', 'Remittance',                  'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial',       'Import'),
  ('ZeroHash',              'FinTech', 'Trading, Crypto & Investing', 'Tier 2', 'Global', 'Engineering, Product, Compliance, Commercial',         'Import')

) AS v(name, sector, sub_sector, priority_tier, region, recommended_functions, source)
WHERE NOT EXISTS (
  SELECT 1 FROM companies c
  WHERE LOWER(c.name) = LOWER(v.name)
);

-- Verify total import count
SELECT COUNT(*) AS total_imported FROM companies WHERE source = 'Import';

-- Show all newly inserted companies by sub_sector
SELECT name, sub_sector, priority_tier, region
FROM companies
WHERE source = 'Import'
ORDER BY sub_sector, name;
