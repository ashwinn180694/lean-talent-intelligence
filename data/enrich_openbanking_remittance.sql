-- ============================================================
-- Enrichment: OpenBanking + Remittance/Crypto Remittance Tier 2
-- Generated: 2026-06-23
-- ============================================================

-- -----------------------------------------------
-- OPEN BANKING COMPANIES
-- -----------------------------------------------

-- 1. Bankable (European BaaS platform)
UPDATE companies SET
  description = 'European Banking-as-a-Service platform enabling financial institutions, corporates, and fintechs to build and deploy white-label payment solutions, e-wallets, and prepaid card programs via API.',
  founded_year = 2010,
  headquarters = 'London, United Kingdom',
  headcount_range = '1-50',
  funding_stage = 'Series A',
  total_raised = '$15M',
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.bankablefintech.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'bankable';

-- 2. NeoTek (open banking - Saudi Arabia)
UPDATE companies SET
  description = 'Saudi Arabia''s first licensed open banking provider, offering data aggregation and payment initiation services to financial institutions across the Kingdom.',
  founded_year = NULL,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1-50',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Al Rajhi Group',
  website_url = 'https://neotek.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'neotek';

-- 3. Salt Edge (open banking API provider)
UPDATE companies SET
  description = 'Global open banking platform providing banks, fintechs, and lenders with account aggregation and payment initiation APIs connected to 5,000+ banks in 50+ countries.',
  founded_year = 2013,
  headquarters = 'Ottawa, Canada',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$3M',
  latest_funding_date = 'Oct 2018',
  key_investors = 'Level39, Start-Up Chile',
  website_url = 'https://www.saltedge.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'salt edge';

-- 4. Single View (open banking)
UPDATE companies SET
  description = NULL,
  founded_year = NULL,
  headquarters = NULL,
  headcount_range = NULL,
  funding_stage = NULL,
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = NULL,
  last_enriched_at = now()
WHERE LOWER(name) = 'single view';

-- 5. Spare (open banking - MENA)
UPDATE companies SET
  description = 'MENA-focused open banking platform providing universal APIs for financial data access and payment initiation, licensed across Saudi Arabia, Bahrain, and Kuwait.',
  founded_year = 2019,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1-50',
  funding_stage = 'Series A',
  total_raised = '$8M',
  latest_funding_date = 'Sep 2025',
  key_investors = 'ANB Capital, Vision Ventures, 500 Global',
  website_url = 'https://tryspare.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'spare';

-- -----------------------------------------------
-- REMITTANCE / CRYPTO REMITTANCE COMPANIES
-- -----------------------------------------------

-- 6. Alchemy Pay (crypto payments/remittance)
UPDATE companies SET
  description = 'Singapore-based hybrid payment gateway bridging fiat and cryptocurrency, enabling merchants and remittance companies to accept crypto payments and on/off-ramp globally.',
  founded_year = 2018,
  headquarters = 'Singapore, Singapore',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$10M',
  latest_funding_date = NULL,
  key_investors = 'DWF Labs, Northbund Capital, Oak Grove Ventures',
  website_url = 'https://alchemypay.org',
  last_enriched_at = now()
WHERE LOWER(name) = 'alchemy pay';

-- 7. Aquanow (crypto liquidity)
UPDATE companies SET
  description = 'Digital asset infrastructure provider enabling banks, brokerages, fintechs, and payment providers to offer institutional-grade crypto trading and stablecoin payment capabilities.',
  founded_year = 2018,
  headquarters = 'Vancouver, Canada',
  headcount_range = '50-200',
  funding_stage = 'Seed',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = 'Radian Capital, Cyberport Hong Kong',
  website_url = 'https://www.aquanow.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'aquanow';

-- 8. Arf (stablecoin trade financing/remittance)
UPDATE companies SET
  description = 'Swiss-regulated global liquidity and settlement platform providing stablecoin-based working capital credit lines to licensed money service businesses for cross-border payments.',
  founded_year = 2019,
  headquarters = 'Zug, Switzerland',
  headcount_range = '1-50',
  funding_stage = 'Seed',
  total_raised = '$13M',
  latest_funding_date = 'Oct 2022',
  key_investors = 'Circle Ventures, Stellar Development Foundation, UOB Venture Management',
  website_url = 'https://arf.one',
  last_enriched_at = now()
WHERE LOWER(name) = 'arf';

-- 9. BitPay (crypto payments)
UPDATE companies SET
  description = 'Atlanta-based enterprise crypto payment processor enabling businesses to accept Bitcoin and other cryptocurrencies, providing crypto billing, payroll, and card solutions.',
  founded_year = 2011,
  headquarters = 'Atlanta, United States',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$103M',
  latest_funding_date = NULL,
  key_investors = 'Aquiline Capital Partners, Index Ventures, Founders Fund',
  website_url = 'https://bitpay.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'bitpay';

-- 10. HarpFi (remittance fintech)
UPDATE companies SET
  description = 'UK-based cross-border payment platform for finance teams, enabling cost-effective international payments with multi-currency accounts across 30+ currencies.',
  founded_year = NULL,
  headquarters = 'London, United Kingdom',
  headcount_range = '1-50',
  funding_stage = NULL,
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://harpfi.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'harpfi';

-- 11. NOAH (crypto remittance)
UPDATE companies SET
  description = 'London-based API-first stablecoin payments infrastructure enabling businesses to send cross-border payments with real-time settlement and built-in compliance across emerging markets.',
  founded_year = 2020,
  headquarters = 'London, United Kingdom',
  headcount_range = '1-50',
  funding_stage = 'Seed',
  total_raised = '$22M',
  latest_funding_date = 'Jun 2025',
  key_investors = 'Felix Capital, FJ Labs, LocalGlobe',
  website_url = 'https://noah.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'noah';

-- 12. OpenPayd (payments infrastructure)
UPDATE companies SET
  description = 'London-based payments and banking-as-a-service platform providing IBANs, multi-currency accounts, FX, open banking, and card processing through a single API for digital economy businesses.',
  founded_year = 2018,
  headquarters = 'London, United Kingdom',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$25M',
  latest_funding_date = 'Aug 2024',
  key_investors = NULL,
  website_url = 'https://www.openpayd.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'openpayd';

-- 13. Rafiki (Mojaloop/Interledger remittance)
UPDATE companies SET
  description = 'Open-source Interledger service by the Interledger Foundation enabling wallet providers to offer standards-based, low-cost cross-border payment and remittance capabilities.',
  founded_year = NULL,
  headquarters = NULL,
  headcount_range = NULL,
  funding_stage = NULL,
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Interledger Foundation',
  website_url = 'https://rafiki.dev',
  last_enriched_at = now()
WHERE LOWER(name) = 'rafiki';

-- 14. Slingmoney (cross-border payments)
UPDATE companies SET
  description = 'Stablecoin-powered global peer-to-peer money transfer app enabling instant international payments across countries through a self-custodial digital wallet.',
  founded_year = 2022,
  headquarters = 'Amsterdam, Netherlands',
  headcount_range = '1-50',
  funding_stage = 'Series A',
  total_raised = '$20M',
  latest_funding_date = 'Aug 2024',
  key_investors = 'Union Square Ventures, Ribbit Capital, Slow Ventures',
  website_url = 'https://sling.money',
  last_enriched_at = now()
WHERE LOWER(name) = 'slingmoney';

-- 15. Sokin (global payments)
UPDATE companies SET
  description = 'London-based fintech providing multi-currency accounts and cross-border payment services for businesses, enabling global treasury management and international transfers on a unified platform.',
  founded_year = 2019,
  headquarters = 'London, United Kingdom',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = '$196M',
  latest_funding_date = 'Dec 2025',
  key_investors = 'Prysm Capital, Morgan Stanley Expansion Capital, Watershed Ventures',
  website_url = 'https://sokin.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'sokin';

-- 16. Tazapay (B2B cross-border payments)
UPDATE companies SET
  description = 'Singapore-based regulated cross-border payment infrastructure company powering same-day settlement across 70+ markets with a per-transaction funding model for fintechs and enterprises.',
  founded_year = 2020,
  headquarters = 'Singapore, Singapore',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$57M',
  latest_funding_date = 'Mar 2026',
  key_investors = 'Circle Ventures, Peak XV Partners, Ripple',
  website_url = 'https://tazapay.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'tazapay';

-- 17. Transak (crypto on-ramp)
UPDATE companies SET
  description = 'Miami-based crypto payments infrastructure provider offering a single API for wallets, fintechs, and financial institutions to enable fiat-to-crypto on/off-ramp in 169 countries.',
  founded_year = 2019,
  headquarters = 'Miami, United States',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$36M',
  latest_funding_date = 'Aug 2025',
  key_investors = 'IDG Capital, Tether, 1kx',
  website_url = 'https://transak.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'transak';

-- 18. Yellowcard (African crypto exchange)
UPDATE companies SET
  description = 'Pan-African cryptocurrency exchange and B2B stablecoin payments platform operating across 20 African countries, enabling cross-border money transfers at lower fees than traditional services.',
  founded_year = 2016,
  headquarters = 'Birmingham, United States',
  headcount_range = '50-200',
  funding_stage = 'Series C',
  total_raised = '$88M',
  latest_funding_date = 'Oct 2024',
  key_investors = 'Blockchain Capital, Coinbase, Polychain Capital',
  website_url = 'https://yellowcard.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'yellowcard';

-- 19. ZeroHash (crypto infrastructure)
UPDATE companies SET
  description = 'Chicago-based crypto and stablecoin infrastructure platform enabling banks, fintechs, and brokerages to embed compliant crypto trading, stablecoin settlement, and tokenization into their products.',
  founded_year = 2017,
  headquarters = 'Chicago, United States',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$275M',
  latest_funding_date = 'Sep 2025',
  key_investors = 'Interactive Brokers, Morgan Stanley, PEAK6',
  website_url = 'https://zerohash.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'zerohash';
