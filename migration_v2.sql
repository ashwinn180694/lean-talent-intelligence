-- ═══════════════════════════════════════════════════════════
-- LEAN TALENT INTELLIGENCE — Migration v2
-- Run in Supabase SQL Editor
-- Adds: ai_summary, hq_country enrichment columns
-- Enriches: headcount_range, funding_stage, total_raised, headquarters, hq_country
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- Add new columns if they don't exist
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ai_summary text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ai_summary_at timestamptz;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hq_country text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headcount_range text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_stage text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS total_raised text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS key_investors text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year integer;

-- Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════
-- ENRICHMENT: Tier 1 companies — headcount, stage, raised, HQ
-- ═══════════════════════════════════════════════════════════

-- Aave
UPDATE companies SET headcount_range='51-200', funding_stage='Series C', total_raised='$25M', headquarters='Switzerland', hq_country='Switzerland', founded_year=2017 WHERE name ILIKE 'Aave';
-- Aptos Labs
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$350M', headquarters='Palo Alto, USA', hq_country='USA', founded_year=2021 WHERE name ILIKE 'Aptos Labs';
-- Avalanche / Ava Labs
UPDATE companies SET headcount_range='201-500', funding_stage='Series B', total_raised='$350M', headquarters='New York, USA', hq_country='USA', founded_year=2018 WHERE name ILIKE '%Avalanche%';
-- BitGo
UPDATE companies SET headcount_range='201-500', funding_stage='Series C', total_raised='$170M', headquarters='Palo Alto, USA', hq_country='USA', founded_year=2013 WHERE name ILIKE 'BitGo';
-- BVNK
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$40M', headquarters='London, UK', hq_country='UK', founded_year=2021 WHERE name ILIKE 'BVNK';
-- Chainlink
UPDATE companies SET headcount_range='201-500', funding_stage='Token / Public', total_raised='$32M', headquarters='Grand Cayman', hq_country='USA', founded_year=2017 WHERE name ILIKE 'Chainlink';
-- Circle
UPDATE companies SET headcount_range='501-1000', funding_stage='Public (NYSE: CRCL)', total_raised='$1.1B', headquarters='Boston, USA', hq_country='USA', founded_year=2013 WHERE name ILIKE 'Circle';
-- Ethena
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$20M', headquarters='Cayman Islands', hq_country='USA', founded_year=2023 WHERE name ILIKE 'Ethena';
-- Fireblocks
UPDATE companies SET headcount_range='501-1000', funding_stage='Series E', total_raised='$1B', headquarters='New York, USA', hq_country='USA', founded_year=2018 WHERE name ILIKE 'Fireblocks';
-- LayerZero
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$290M', headquarters='Vancouver, Canada', hq_country='Canada', founded_year=2021 WHERE name ILIKE 'LayerZero';
-- Ledger
UPDATE companies SET headcount_range='501-1000', funding_stage='Series C', total_raised='$380M', headquarters='Paris, France', hq_country='France', founded_year=2014 WHERE name ILIKE 'Ledger';
-- MangoPay
UPDATE companies SET headcount_range='201-500', funding_stage='Series B', total_raised='$75M', headquarters='Luxembourg', hq_country='Luxembourg', founded_year=2013 WHERE name ILIKE 'MangoPay';
-- Network International
UPDATE companies SET headcount_range='1001-5000', funding_stage='Public (LON: NETW)', total_raised='IPO', headquarters='Dubai, UAE', hq_country='UAE', founded_year=1994 WHERE name ILIKE 'Network International';
-- Nuvei
UPDATE companies SET headcount_range='1001-5000', funding_stage='Public (NASDAQ: NVEI)', total_raised='IPO', headquarters='Montreal, Canada', hq_country='Canada', founded_year=2003 WHERE name ILIKE 'Nuvei';
-- OKX
UPDATE companies SET headcount_range='1001-5000', funding_stage='Private', total_raised='Undisclosed', headquarters='Seychelles', hq_country='Seychelles', founded_year=2017 WHERE name ILIKE 'OKX';
-- PPRO
UPDATE companies SET headcount_range='201-500', funding_stage='Series C', total_raised='$270M', headquarters='London, UK', hq_country='UK', founded_year=2006 WHERE name ILIKE 'PPRO';
-- Payrails
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$12M', headquarters='Munich, Germany', hq_country='Germany', founded_year=2021 WHERE name ILIKE 'Payrails';
-- Paysafe
UPDATE companies SET headcount_range='1001-5000', funding_stage='Public (NYSE: PSFE)', total_raised='IPO', headquarters='London, UK', hq_country='UK', founded_year=1996 WHERE name ILIKE 'Paysafe';
-- Phantom
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$109M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2021 WHERE name ILIKE 'Phantom';
-- Pleo
UPDATE companies SET headcount_range='501-1000', funding_stage='Series C', total_raised='$200M', headquarters='Copenhagen, Denmark', hq_country='Denmark', founded_year=2015 WHERE name ILIKE 'Pleo';
-- Polygon
UPDATE companies SET headcount_range='201-500', funding_stage='Token / Public', total_raised='$450M', headquarters='Bangalore, India', hq_country='India', founded_year=2017 WHERE name ILIKE 'Polygon';
-- Primer
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$50M', headquarters='London, UK', hq_country='UK', founded_year=2020 WHERE name ILIKE 'Primer';
-- Tether
UPDATE companies SET headcount_range='51-200', funding_stage='Private', total_raised='Undisclosed', headquarters='BVI', hq_country='BVI', founded_year=2014 WHERE name ILIKE 'Tether';
-- Uniswap
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$180M', headquarters='New York, USA', hq_country='USA', founded_year=2018 WHERE name ILIKE 'Uniswap%';
-- Western Union
UPDATE companies SET headcount_range='10000+', funding_stage='Public (NYSE: WU)', total_raised='IPO', headquarters='Denver, USA', hq_country='USA', founded_year=1851 WHERE name ILIKE 'Western Union';
-- Zepz
UPDATE companies SET headcount_range='501-1000', funding_stage='Series E', total_raised='$292M', headquarters='London, UK', hq_country='UK', founded_year=2010 WHERE name ILIKE 'Zepz';
-- Elm
UPDATE companies SET headcount_range='201-500', funding_stage='Government', total_raised='N/A', headquarters='Riyadh, Saudi Arabia', hq_country='Saudi Arabia', founded_year=2005 WHERE name ILIKE 'Elm';
-- Banked
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$20M', headquarters='London, UK', hq_country='UK', founded_year=2018 WHERE name ILIKE 'Banked';
-- Visa
UPDATE companies SET headcount_range='10000+', funding_stage='Public (NYSE: V)', total_raised='IPO', headquarters='San Francisco, USA', hq_country='USA', founded_year=1958 WHERE name ILIKE 'Visa';
-- Mastercard
UPDATE companies SET headcount_range='10000+', funding_stage='Public (NYSE: MA)', total_raised='IPO', headquarters='Purchase, USA', hq_country='USA', founded_year=1966 WHERE name ILIKE 'Mastercard';

-- ═══════════════════════════════════════════════════════════
-- ENRICHMENT: Tier 2 — GCC / MENA
-- ═══════════════════════════════════════════════════════════
UPDATE companies SET headcount_range='201-500', funding_stage='Series B', total_raised='$57M', headquarters='Jeddah, Saudi Arabia', hq_country='Saudi Arabia', founded_year=2016 WHERE name ILIKE 'Sary';
UPDATE companies SET headcount_range='201-500', funding_stage='Series C', total_raised='$220M', headquarters='Cairo, Egypt', hq_country='Egypt', founded_year=2018 WHERE name ILIKE 'MNT Halan';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$28M', headquarters='Riyadh, Saudi Arabia', hq_country='Saudi Arabia', founded_year=2015 WHERE name ILIKE 'Lendo';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$12M', headquarters='Dubai, UAE', hq_country='UAE', founded_year=2020 WHERE name ILIKE 'Now Money';
UPDATE companies SET headcount_range='201-500', funding_stage='Series B', total_raised='$23M', headquarters='Riyadh, Saudi Arabia', hq_country='Saudi Arabia', founded_year=2018 WHERE name ILIKE 'Foodics%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$5M', headquarters='Dubai, UAE', hq_country='UAE', founded_year=2019 WHERE name ILIKE 'Alinma Pay' OR name ILIKE 'alinma';
UPDATE companies SET headcount_range='1001-5000', funding_stage='Public (Tadawul)', total_raised='IPO', headquarters='Riyadh, Saudi Arabia', hq_country='Saudi Arabia', founded_year=2003 WHERE name ILIKE 'HyperPay';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$30M', headquarters='Dubai, UAE', hq_country='UAE', founded_year=2021 WHERE name ILIKE 'Fasset';
UPDATE companies SET headcount_range='201-500', funding_stage='Series B', total_raised='$50M', headquarters='Dubai, UAE', hq_country='UAE', founded_year=2019 WHERE name ILIKE 'Tap%';

-- ═══════════════════════════════════════════════════════════
-- ENRICHMENT: Tier 2 — Global crypto / stablecoin
-- ═══════════════════════════════════════════════════════════
UPDATE companies SET headcount_range='201-500', funding_stage='Series C', total_raised='$555M', headquarters='New York, USA', hq_country='USA', founded_year=2018 WHERE name ILIKE 'Moonpay';
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$40M', headquarters='London, UK', hq_country='UK', founded_year=2019 WHERE name ILIKE 'Transak';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$35M', headquarters='Chicago, USA', hq_country='USA', founded_year=2019 WHERE name ILIKE 'ZeroHash';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$47M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2017 WHERE name ILIKE 'Securitize';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$30M', headquarters='New York, USA', hq_country='USA', founded_year=2020 WHERE name ILIKE 'Arf%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$18M', headquarters='Singapore', hq_country='Singapore', founded_year=2020 WHERE name ILIKE 'Tazapay';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$26M', headquarters='London, UK', hq_country='UK', founded_year=2019 WHERE name ILIKE 'Sokin';
UPDATE companies SET headcount_range='201-500', funding_stage='Series B', total_raised='$63M', headquarters='London, UK', hq_country='UK', founded_year=2020 WHERE name ILIKE 'Salt Edge';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$15M', headquarters='Singapore', hq_country='Singapore', founded_year=2018 WHERE name ILIKE 'OpenPayd';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$35M', headquarters='London, UK', hq_country='UK', founded_year=2014 WHERE name ILIKE 'Elliptic';
UPDATE companies SET headcount_range='201-500', funding_stage='Series D', total_raised='$170M', headquarters='New York, USA', hq_country='USA', founded_year=2014 WHERE name ILIKE 'Chainalysis';
UPDATE companies SET headcount_range='201-500', funding_stage='Series C', total_raised='$60M', headquarters='London, UK', hq_country='UK', founded_year=2017 WHERE name ILIKE 'Yellow Card';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$28M', headquarters='London, UK', hq_country='UK', founded_year=2021 WHERE name ILIKE 'Mural%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$38M', headquarters='London, UK', hq_country='UK', founded_year=2020 WHERE name ILIKE 'Ramp%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$25M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2022 WHERE name ILIKE 'Morpho%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$12M', headquarters='Paris, France', hq_country='France', founded_year=2020 WHERE name ILIKE 'Flowdesk';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$22M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2021 WHERE name ILIKE 'Superstate%';
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$30M', headquarters='New York, USA', hq_country='USA', founded_year=2022 WHERE name ILIKE 'Agora%';
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$8M', headquarters='New York, USA', hq_country='USA', founded_year=2022 WHERE name ILIKE 'Mountain Protocol';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$50M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2020 WHERE name ILIKE 'Fireblocks';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$20M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2021 WHERE name ILIKE 'Dynamic%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$18M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2020 WHERE name ILIKE 'Privy%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$13M', headquarters='Paris, France', hq_country='France', founded_year=2021 WHERE name ILIKE 'Dfns%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$40M', headquarters='New York, USA', hq_country='USA', founded_year=2019 WHERE name ILIKE 'Allium%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$26M', headquarters='Chicago, USA', hq_country='USA', founded_year=2019 WHERE name ILIKE 'Crossmint%';
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$10M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2022 WHERE name ILIKE 'Huma%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$16M', headquarters='Singapore', hq_country='Singapore', founded_year=2022 WHERE name ILIKE 'Solv%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$10M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2022 WHERE name ILIKE 'Noble%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$22M', headquarters='London, UK', hq_country='UK', founded_year=2021 WHERE name ILIKE 'OpenEden%';
UPDATE companies SET headcount_range='11-50', funding_stage='Series A', total_raised='$12M', headquarters='Singapore', hq_country='Singapore', founded_year=2021 WHERE name ILIKE 'Mento%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series B', total_raised='$45M', headquarters='New York, USA', hq_country='USA', founded_year=2019 WHERE name ILIKE 'MESH%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$15M', headquarters='San Francisco, USA', hq_country='USA', founded_year=2021 WHERE name ILIKE 'Caliza%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$20M', headquarters='London, UK', hq_country='UK', founded_year=2021 WHERE name ILIKE 'Mansa%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$18M', headquarters='Singapore', hq_country='Singapore', founded_year=2022 WHERE name ILIKE 'Huma%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$7M', headquarters='Tel Aviv, Israel', hq_country='Israel', founded_year=2020 WHERE name ILIKE 'Rise%';
UPDATE companies SET headcount_range='201-500', funding_stage='Series C', total_raised='$100M', headquarters='Bogota, Colombia', hq_country='Colombia', founded_year=2018 WHERE name ILIKE 'El Dorado%';
UPDATE companies SET headcount_range='51-200', funding_stage='Series A', total_raised='$25M', headquarters='London, UK', hq_country='UK', founded_year=2020 WHERE name ILIKE 'Sling%';

COMMIT;
