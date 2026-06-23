-- ============================================================
-- Lean Talent Intelligence — Stablecoin Landscape Import
-- Source: "The Stablecoin Sandwich & Landscape" (CB Insights / Fipto)
-- ============================================================
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard/project/fechmjopuwnsyfpslwzq/editor
--   2. Paste this entire file and click Run
--
-- All companies use sub_sector = 'Stablecoins'
-- NOT EXISTS check prevents any duplicates (case-insensitive)
-- ============================================================

INSERT INTO companies (name, sector, sub_sector, priority_tier, region, recommended_functions, source)
SELECT v.name, v.sector, v.sub_sector, v.priority_tier, v.region, v.recommended_functions, v.source
FROM (VALUES

  -- ── Enterprise & B2B ──────────────────────────────────────
  ('Acctual',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BITWAVE',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BVNK',              'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('coinsub',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Conduit',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('crossmint',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('cryptio',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Dannisa',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Infinite',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('LIMITED',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('nilos',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Orbital',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('OuilTing',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('RD Technologies',   'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('rise',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('TOKU',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),

  -- ── Liquidity & Yield ─────────────────────────────────────
  ('Aave',              'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('AlloyX',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Avalon Labs',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BLAST',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('CAP',               'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('coinchange',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('ELFi',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Elixir',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Ethena',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('eywa',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Flowdesk',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('fortunafi',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('HARAKA',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Huma',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('MANSA',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Morpho',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('nexus',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Open Delta',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('OpenEden',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('OpenTrade',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('PERENA',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Qiro',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('SALT',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Smilee',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Solv',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Stable Jack',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('StakeStone',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Superform',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Superstate',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('TORCH',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Zoth',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),

  -- ── Blockchain Infrastructure ─────────────────────────────
  ('Aptos Labs',        'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Avalanche',         'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Brale',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Chainlink',         'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('LayerZero',         'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('MANTA',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Mento Labs',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('OpenZK',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Polygon',           'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Pyth',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('QuickNode',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('RedStone',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Router Protocol',   'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Securitize',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('TON',               'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),

  -- ── Exchanges / On & Off Ramps ────────────────────────────
  ('Alchemy Pay',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('Binance',           'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('El Dorado',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Klickl',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Kotani Pay',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Kraken',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('Meso',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Metatime',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('MoneyGram',         'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('MoonPay',           'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('Neverless',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('ONRAMP',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('PEXX',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Ramp',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('Stable Sea',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Thalex',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Transak',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('TrueX',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Uniswap',           'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Yellow Card',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),

  -- ── Wallets & Custodians ──────────────────────────────────
  ('UniPass',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('akaunt',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('belo',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BitGo',             'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('cenoa',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('CENTI',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Cypher',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Dfns',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('dynamic',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Fireblocks',        'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('karsa',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('KAST',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('kredete',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Ledger',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('littio',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Open Settlements',  'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('parallax',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('PARFIN',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Paytaca',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Phantom',           'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('privy',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Sling Money',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('stables',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('turnkey',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('utila',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),

  -- ── Issuers ───────────────────────────────────────────────
  ('Aegis',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('AGORA',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Ampleforth',        'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('anzen',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BIMA',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BRLA',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Circle',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('etherfuse',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Fluid Protocol',    'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Galactic Holdings', 'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Hermetica',         'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('IDA',               'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('JadeCity',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('JPYC',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('LAMBDA',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Level',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('M0',                'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Mountain Protocol', 'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Next Generation',   'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Noble',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('QuantOZ',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('RESOLV',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Ripple',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('Satoshi',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('SBC',               'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Schuman Financial', 'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('StabIR',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Tapioca',           'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Tether',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('USDX',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('USUAL',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('w3i',               'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('WSPN',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),

  -- ── Analytics & Monitoring ────────────────────────────────
  ('Allium',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Bluechip',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Chainalysis',       'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('CoinMetrics',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Elliptic',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Compliance, Commercial',   'Import-Stablecoins'),
  ('Proven',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),

  -- ── Payments Processing ───────────────────────────────────
  ('1MONEY',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('BAANX',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Borderless.xyz',    'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('caliza',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('CODEX',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Coinflow',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('due',               'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('fipto',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Hamsa',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('ivorypay',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('koywe',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('MESH',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('MURAL',             'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Plasma',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Portal',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('rain',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('sati',              'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Shield',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Six Clovers',       'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('sphere',            'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Stripe',            'FinTech', 'Stablecoins', 'Tier 1', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins'),
  ('talentir',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Commercial',               'Import-Stablecoins'),
  ('Triple A',          'FinTech', 'Stablecoins', 'Tier 2', 'Global', 'Engineering, Product, Partnerships, Commercial', 'Import-Stablecoins')

) AS v(name, sector, sub_sector, priority_tier, region, recommended_functions, source)
WHERE NOT EXISTS (
  SELECT 1 FROM companies c
  WHERE LOWER(c.name) = LOWER(v.name)
);

-- Verify
SELECT COUNT(*) AS stablecoin_companies_inserted
FROM companies WHERE source = 'Import-Stablecoins';

SELECT name, priority_tier
FROM companies WHERE source = 'Import-Stablecoins'
ORDER BY priority_tier, name;
