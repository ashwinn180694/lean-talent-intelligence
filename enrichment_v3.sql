BEGIN;

-- ============================================================
-- LINKEDIN URL FIXES
-- ============================================================

UPDATE companies SET linkedin_company_url='https://www.linkedin.com/company/accesspay/' WHERE name ILIKE 'AccessPay';
UPDATE companies SET linkedin_company_url='https://www.linkedin.com/company/belvo-api/' WHERE name ILIKE 'Belvo';
UPDATE companies SET linkedin_company_url='https://www.linkedin.com/company/brexhq/' WHERE name ILIKE 'Brex';
UPDATE companies SET linkedin_company_url='https://www.linkedin.com/company/varomoney/' WHERE name ILIKE 'Varo Money';

-- ============================================================
-- NAME & URL FIXES
-- ============================================================

-- TransferWise → Wise (company rebranded in 2021)
UPDATE companies SET name='Wise', website_url='https://wise.com', linkedin_company_url='https://www.linkedin.com/company/wiseaccount/' WHERE name ILIKE 'TRANSFERWISE';

-- Fix Elliptic spelling (stored as 'Ellpitic')
UPDATE companies SET name='Elliptic' WHERE name ILIKE 'Ellpitic';

-- ============================================================
-- BREX — fix wrongly marked 'Acquired' (was incorrect; now correctly Acquired by Capital One April 2026)
-- ============================================================

UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Acquired',
  total_raised='$1.5B',
  headquarters='San Francisco, United States',
  hq_country='United States',
  founded_year=2017,
  linkedin_company_url='https://www.linkedin.com/company/brexhq/'
WHERE name ILIKE 'Brex';

-- ============================================================
-- GOCARDLESS — fix wrongly marked 'Acquired' note: GoCardless WAS acquired by Mollie in Dec 2025
-- ============================================================

UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Acquired',
  total_raised='$621M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2011,
  linkedin_company_url='https://www.linkedin.com/company/gocardless'
WHERE name ILIKE 'GoCardless';

-- ============================================================
-- TIER 1 COMPANIES
-- ============================================================

UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series B',
  total_raised='$44M',
  headquarters='Manchester, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/accesspay/'
WHERE name ILIKE 'AccessPay';

UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series A',
  total_raised='$74M',
  headquarters='São Paulo, Brazil',
  hq_country='Brazil',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/belvo-api/'
WHERE name ILIKE 'Belvo';

-- Bolt (Financial) — checkout fintech, San Francisco
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series E',
  total_raised='$947M',
  headquarters='San Francisco, United States',
  hq_country='United States',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/bolt-com'
WHERE name ILIKE 'Bolt';

UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series A',
  total_raised='$13M',
  headquarters='San Mateo, United States',
  hq_country='United States',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/checkbook'
WHERE name ILIKE 'Checkbook Inc';

UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series C',
  total_raised='$211M',
  headquarters='New York, United States',
  hq_country='United States',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/alloy-apis'
WHERE name ILIKE 'Alloy';

UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Bootstrapped',
  total_raised='Undisclosed',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2009,
  linkedin_company_url='https://www.linkedin.com/company/astropay-llp'
WHERE name ILIKE 'ASTROPAY';

UPDATE companies SET
  headcount_range='11-50',
  funding_stage='Bootstrapped',
  total_raised='Undisclosed',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/bilderlings'
WHERE name ILIKE 'Bilderlings';

UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series B',
  total_raised='$103M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/bud-financial'
WHERE name ILIKE 'Bud';

UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series A',
  total_raised='$373M',
  headquarters='Amsterdam, Netherlands',
  hq_country='Netherlands',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/bunq'
WHERE name ILIKE 'Bunq';

UPDATE companies SET
  headcount_range='11-50',
  funding_stage='Series A',
  total_raised='$14M',
  headquarters='Stockholm, Sweden',
  hq_country='Sweden',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/chromaway'
WHERE name ILIKE 'CHROMAWAY';

UPDATE companies SET
  headcount_range='11-50',
  funding_stage='Acquired',
  total_raised='$18M',
  headquarters='Copenhagen, Denmark',
  hq_country='Denmark',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/coinify'
WHERE name ILIKE 'Coinify';

UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series C',
  total_raised='$167M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/complyadvantage'
WHERE name ILIKE 'ComplyAdvantage';

UPDATE companies SET
  headcount_range='1-50',
  funding_stage='Seed',
  total_raised='$33M',
  headquarters='Sydney, Australia',
  hq_country='Australia',
  founded_year=2020,
  linkedin_company_url='https://www.linkedin.com/company/cloudfloat'
WHERE name ILIKE 'Cloudfloat';

-- CURVE — acquired by Lloyds Banking Group November 2025
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Acquired',
  total_raised='$323M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/curve-ltd'
WHERE name ILIKE 'CURVE';

-- Elliptic (fix spelling handled above; match on corrected name)
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series D',
  total_raised='$241M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2013,
  linkedin_company_url='https://www.linkedin.com/company/ellipticco'
WHERE name ILIKE 'Elliptic';

-- Feedzai — HQ is Coimbra, Portugal
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series E',
  total_raised='$352M',
  headquarters='Coimbra, Portugal',
  hq_country='Portugal',
  founded_year=2011,
  linkedin_company_url='https://www.linkedin.com/company/feedzai'
WHERE name ILIKE 'Feedzai';

-- Finicity — acquired by Mastercard 2020
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Acquired',
  total_raised='$71M',
  headquarters='Salt Lake City, United States',
  hq_country='United States',
  founded_year=1999,
  linkedin_company_url='https://www.linkedin.com/company/finicity'
WHERE name ILIKE 'Finicity';

-- FinAPI — acquired by Fabrick 2025
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Acquired',
  total_raised='Undisclosed',
  headquarters='Munich, Germany',
  hq_country='Germany',
  founded_year=2008,
  linkedin_company_url='https://www.linkedin.com/company/finapi'
WHERE name ILIKE 'FinAPI';

-- Finxact — acquired by Fiserv 2022
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Acquired',
  total_raised='$75M',
  headquarters='Jacksonville, United States',
  hq_country='United States',
  founded_year=2016,
  linkedin_company_url='https://www.linkedin.com/company/finxact'
WHERE name ILIKE 'Finxact';

UPDATE companies SET
  headcount_range='1-50',
  funding_stage='Seed',
  total_raised='Undisclosed',
  headquarters='Miami, United States',
  hq_country='United States',
  founded_year=2017,
  linkedin_company_url='https://www.linkedin.com/company/hydrogenplatform'
WHERE name ILIKE 'Hydrogen';

-- Marqeta — public (Nasdaq: MQ)
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='Oakland, United States',
  hq_country='United States',
  founded_year=2010,
  linkedin_company_url='https://www.linkedin.com/company/marqeta'
WHERE name ILIKE 'Marqeta';

-- Monzo — UK neobank
UPDATE companies SET
  headcount_range='5000+',
  funding_stage='Series I',
  total_raised='$1.81B',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/monzo-bank'
WHERE name ILIKE 'Monzo';

-- N26 — German neobank
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series E',
  total_raised='$1.72B',
  headquarters='Berlin, Germany',
  hq_country='Germany',
  founded_year=2013,
  linkedin_company_url='https://www.linkedin.com/company/n26'
WHERE name ILIKE 'N26';

-- RatePay — now part of Nexi Group
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Acquired',
  total_raised='Undisclosed',
  headquarters='Berlin, Germany',
  hq_country='Germany',
  founded_year=2009,
  linkedin_company_url='https://www.linkedin.com/company/ratepay'
WHERE name ILIKE 'RatePay';

UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series E',
  total_raised='$650M',
  headquarters='Incline Village, United States',
  hq_country='United States',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/socure'
WHERE name ILIKE 'Socure';

-- Starling Bank — UK neobank (Series D)
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series D',
  total_raised='$1.06B',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/starlingbank'
WHERE name ILIKE 'Starling Bank';

UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series D',
  total_raised='$477M',
  headquarters='Vancouver, Canada',
  hq_country='Canada',
  founded_year=2011,
  linkedin_company_url='https://www.linkedin.com/company/trulioo'
WHERE name ILIKE 'Trulioo';

-- Stitch (Stitch Money) — South African open banking
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series B',
  total_raised='$107M',
  headquarters='Cape Town, South Africa',
  hq_country='South Africa',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/stitchmoney'
WHERE name ILIKE 'Stitch';

-- Affirm — public (Nasdaq: AFRM)
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='San Francisco, United States',
  hq_country='United States',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/affirm'
WHERE name ILIKE 'Affirm';

-- Backbase — Netherlands digital banking platform
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series D',
  total_raised='$129M',
  headquarters='Amsterdam, Netherlands',
  hq_country='Netherlands',
  founded_year=2003,
  linkedin_company_url='https://www.linkedin.com/company/backbase'
WHERE name ILIKE 'Backbase';

-- Careem — acquired by Uber 2020; e& took majority stake in Super App 2023
UPDATE companies SET
  headcount_range='5000+',
  funding_stage='Acquired',
  total_raised='$772M',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/careem'
WHERE name ILIKE 'Careem';

-- Greenlight — family fintech, Atlanta
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series C',
  total_raised='$556M',
  headquarters='Atlanta, United States',
  hq_country='United States',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/greenlightcard'
WHERE name ILIKE 'Greenlight';

UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series G',
  total_raised='$1.12B',
  headquarters='San Francisco, United States',
  hq_country='United States',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/varomoney/'
WHERE name ILIKE 'Varo Money';

-- YAP — UAE neobank
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Seed',
  total_raised='$41M',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2020,
  linkedin_company_url='https://www.linkedin.com/company/yapbanking'
WHERE name ILIKE 'YAP';

-- ZOPA — UK lending/neobank
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series C',
  total_raised='$750M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2004,
  linkedin_company_url='https://www.linkedin.com/company/zopabank'
WHERE name ILIKE 'ZOPA';

UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series D',
  total_raised='$1.1B',
  headquarters='New York, United States',
  hq_country='United States',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/dailypay-inc'
WHERE name ILIKE 'DailyPay';

-- Bill (bill.com) — public (NYSE: BILL)
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='San Jose, United States',
  hq_country='United States',
  founded_year=2006,
  linkedin_company_url='https://www.linkedin.com/company/bill'
WHERE name ILIKE 'Bill';

-- Finastra — private equity, owned by Vista Equity Partners
UPDATE companies SET
  headcount_range='10000+',
  funding_stage='Private Equity',
  total_raised='$5.3B',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2017,
  linkedin_company_url='https://www.linkedin.com/company/finastra'
WHERE name ILIKE 'Finastra';

-- Flutterwave — Series D, Nigerian payments
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series D',
  total_raised='$489M',
  headquarters='San Francisco, United States',
  hq_country='United States',
  founded_year=2016,
  linkedin_company_url='https://www.linkedin.com/company/flutterwave'
WHERE name ILIKE 'Flutterwave';

-- Geidea — Saudi payments/POS company
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Private Equity',
  total_raised='$266M',
  headquarters='Riyadh, Saudi Arabia',
  hq_country='Saudi Arabia',
  founded_year=2008,
  linkedin_company_url='https://www.linkedin.com/company/geidea'
WHERE name ILIKE 'Geidea';

-- Kuda — Nigerian neobank
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series B',
  total_raised='$112M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/joinkuda'
WHERE name ILIKE 'Kuda';

-- Lean Technologies — Saudi open banking API
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series B',
  total_raised='$100M',
  headquarters='Riyadh, Saudi Arabia',
  hq_country='Saudi Arabia',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/leantechnologies'
WHERE name ILIKE 'Lean Technologies';

-- Mamo — UAE payments startup
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Seed',
  total_raised='$13M',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/mamo'
WHERE name ILIKE 'Mamo';

-- Moniepoint — Nigerian fintech
UPDATE companies SET
  headcount_range='5000+',
  funding_stage='Series C',
  total_raised='$266M',
  headquarters='Lagos, Nigeria',
  hq_country='Nigeria',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/moniepoint-inc'
WHERE name ILIKE 'Moniepoint';

-- Nubank — public (NYSE: NU), Brazilian neobank
UPDATE companies SET
  headcount_range='10000+',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='São Paulo, Brazil',
  hq_country='Brazil',
  founded_year=2013,
  linkedin_company_url='https://www.linkedin.com/company/nubank'
WHERE name ILIKE 'Nubank';

-- Paystack — acquired by Stripe 2020
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Acquired',
  total_raised='$200M',
  headquarters='Lagos, Nigeria',
  hq_country='Nigeria',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/paystack'
WHERE name ILIKE 'Paystack';

-- Solaris (solarisBank) — German banking-as-a-service
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series G',
  total_raised='$736M',
  headquarters='Berlin, Germany',
  hq_country='Germany',
  founded_year=2016,
  linkedin_company_url='https://www.linkedin.com/company/solariscompany'
WHERE name ILIKE 'Solaris';

-- TymeBank — South African digital bank (Tyme Group)
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series D',
  total_raised='$600M',
  headquarters='Johannesburg, South Africa',
  hq_country='South Africa',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/tymebank'
WHERE name ILIKE 'TymeBank';

-- Yoco — South African payments
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series C',
  total_raised='$107M',
  headquarters='Cape Town, South Africa',
  hq_country='South Africa',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/yoco'
WHERE name ILIKE 'Yoco';

-- 10x Banking — UK cloud banking platform
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series C',
  total_raised='$349M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2016,
  linkedin_company_url='https://www.linkedin.com/company/10x-banking'
WHERE name ILIKE '10x Banking';

-- Cashcloud — acquired by InFin 2016, Luxembourg
UPDATE companies SET
  headcount_range='11-50',
  funding_stage='Acquired',
  total_raised='$4M',
  headquarters='Luxembourg, Luxembourg',
  hq_country='Luxembourg',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/getcashcloud'
WHERE name ILIKE 'Cashcloud';

-- Verto (VertoFX) — UK B2B FX fintech
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series A',
  total_raised='$12M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/vertofx'
WHERE name ILIKE 'Verto';

-- Wise (formerly TransferWise) — public (London Stock Exchange)
UPDATE companies SET
  headcount_range='5000+',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2011,
  linkedin_company_url='https://www.linkedin.com/company/wiseaccount/'
WHERE name ILIKE 'Wise';

-- ============================================================
-- TIER 2 COMPANIES
-- ============================================================

UPDATE companies SET
  headcount_range='11-50',
  funding_stage='Series B',
  total_raised='$8M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2018,
  linkedin_company_url='https://www.linkedin.com/company/3s-money'
WHERE name ILIKE '3S Money';

-- Al Rajhi Bank — large Saudi public bank
UPDATE companies SET
  headcount_range='10000+',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='Riyadh, Saudi Arabia',
  hq_country='Saudi Arabia',
  founded_year=1957,
  linkedin_company_url='https://www.linkedin.com/company/alrajhibank'
WHERE name ILIKE 'Al Rajhi Bank';

-- Alinma Bank — Saudi public bank
UPDATE companies SET
  headcount_range='5000+',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='Riyadh, Saudi Arabia',
  hq_country='Saudi Arabia',
  founded_year=2006,
  linkedin_company_url='https://www.linkedin.com/company/alinma-bank'
WHERE name ILIKE 'Alinma Bank';

-- Alipay — Chinese fintech (Ant Group), private
UPDATE companies SET
  headcount_range='10000+',
  funding_stage='Private',
  total_raised='Undisclosed',
  headquarters='Hangzhou, China',
  hq_country='China',
  founded_year=2004,
  linkedin_company_url='https://www.linkedin.com/company/alipay'
WHERE name ILIKE 'Alipay';

-- Amazon Payment Services (formerly PAYFORT) — Amazon division
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Acquired',
  total_raised='Undisclosed',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2013,
  linkedin_company_url='https://www.linkedin.com/company/amazon-payment-services'
WHERE name ILIKE 'Amazon Payment Services';

-- American Express — public (NYSE: AXP)
UPDATE companies SET
  headcount_range='10000+',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='New York, United States',
  hq_country='United States',
  founded_year=1850,
  linkedin_company_url='https://www.linkedin.com/company/american-express'
WHERE name ILIKE 'American Express';

-- Apple — public (Nasdaq: AAPL)
UPDATE companies SET
  headcount_range='10000+',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='Cupertino, United States',
  hq_country='United States',
  founded_year=1976,
  linkedin_company_url='https://www.linkedin.com/company/apple'
WHERE name ILIKE 'Apple';

-- Avant — US consumer lending
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series E',
  total_raised='$905M',
  headquarters='Chicago, United States',
  hq_country='United States',
  founded_year=2012,
  linkedin_company_url='https://www.linkedin.com/company/avant-us'
WHERE name ILIKE 'Avant';

-- Betterment — US robo-advisor
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series F',
  total_raised='$435M',
  headquarters='New York, United States',
  hq_country='United States',
  founded_year=2010,
  linkedin_company_url='https://www.linkedin.com/company/betterment'
WHERE name ILIKE 'Betterment';

-- BitOasis — acquired by CoinDCX July 2024
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Acquired',
  total_raised='$40M',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/bitoasis-technologies-fze'
WHERE name ILIKE 'BitOasis';

-- Bitpanda — Austrian crypto/investment platform
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series C',
  total_raised='$530M',
  headquarters='Vienna, Austria',
  hq_country='Austria',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/bitpanda'
WHERE name ILIKE 'Bitpanda';

-- BlueVine — US SMB banking
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series F',
  total_raised='$770M',
  headquarters='Jersey City, United States',
  hq_country='United States',
  founded_year=2013,
  linkedin_company_url='https://www.linkedin.com/company/bluevine'
WHERE name ILIKE 'BlueVine';

-- Chime — public (Nasdaq: CHYM, IPO June 2025)
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Public',
  total_raised='IPO',
  headquarters='San Francisco, United States',
  hq_country='United States',
  founded_year=2013,
  linkedin_company_url='https://www.linkedin.com/company/chime-card'
WHERE name ILIKE 'Chime';

-- ClearScore — UK credit score fintech
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series B',
  total_raised='$294M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/clearscore'
WHERE name ILIKE 'CLEARSCORE';

-- Fenergo — Irish RegTech, private equity backed
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Private Equity',
  total_raised='$760M',
  headquarters='Dublin, Ireland',
  hq_country='Ireland',
  founded_year=2009,
  linkedin_company_url='https://www.linkedin.com/company/fenergo'
WHERE name ILIKE 'Fenergo';

-- Huspy — UAE mortgage/real estate fintech
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series B',
  total_raised='$96M',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2020,
  linkedin_company_url='https://www.linkedin.com/company/huspy'
WHERE name ILIKE 'Huspy';

-- Lydia — French payments app
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series C',
  total_raised='$260M',
  headquarters='Paris, France',
  hq_country='France',
  founded_year=2011,
  linkedin_company_url='https://www.linkedin.com/company/lydia'
WHERE name ILIKE 'Lydia';

-- Mamo Pay — UAE payments (note: may overlap with 'Mamo' entry above — same company)
UPDATE companies SET
  headcount_range='1-50',
  funding_stage='Seed',
  total_raised='$13M',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2019,
  linkedin_company_url='https://www.linkedin.com/company/mamo'
WHERE name ILIKE 'Mamo Pay';

-- Meniga — Icelandic/UK personal finance management
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series D',
  total_raised='$60M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2009,
  linkedin_company_url='https://www.linkedin.com/company/meniga'
WHERE name ILIKE 'Meniga';

-- MNT-Halan — Egyptian fintech (also stored as 'MNT Halan')
UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series C',
  total_raised='$677M',
  headquarters='Cairo, Egypt',
  hq_country='Egypt',
  founded_year=2018,
  linkedin_company_url='https://www.linkedin.com/company/mnt-halan'
WHERE name ILIKE 'MNT-Halan';

UPDATE companies SET
  headcount_range='1001-5000',
  funding_stage='Series C',
  total_raised='$677M',
  headquarters='Cairo, Egypt',
  hq_country='Egypt',
  founded_year=2018,
  linkedin_company_url='https://www.linkedin.com/company/mnt-halan'
WHERE name ILIKE 'MNT Halan';

-- MONESE — acquired by Pockit October 2024
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Acquired',
  total_raised='$269M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2015,
  linkedin_company_url='https://www.linkedin.com/company/monese'
WHERE name ILIKE 'MONESE';

-- MultiBank Group — UAE trading/financial services, bootstrapped
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Bootstrapped',
  total_raised='Undisclosed',
  headquarters='Dubai, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2005,
  linkedin_company_url='https://www.linkedin.com/company/multibankgroup'
WHERE name ILIKE 'MultiBank Group';

-- Nymcard — UAE card-issuing platform
UPDATE companies SET
  headcount_range='201-500',
  funding_stage='Series B',
  total_raised='$63M',
  headquarters='Abu Dhabi, United Arab Emirates',
  hq_country='United Arab Emirates',
  founded_year=2018,
  linkedin_company_url='https://www.linkedin.com/company/nymcard'
WHERE name ILIKE 'Nymcard';

-- PayTabs — Saudi payments gateway
UPDATE companies SET
  headcount_range='51-200',
  funding_stage='Series B',
  total_raised='$20M',
  headquarters='Riyadh, Saudi Arabia',
  hq_country='Saudi Arabia',
  founded_year=2014,
  linkedin_company_url='https://www.linkedin.com/company/paytabs-holding-company'
WHERE name ILIKE 'PayTabs';

-- Quantexa — UK data intelligence / financial crime
UPDATE companies SET
  headcount_range='501-1000',
  funding_stage='Series F',
  total_raised='$546M',
  headquarters='London, United Kingdom',
  hq_country='United Kingdom',
  founded_year=2016,
  linkedin_company_url='https://www.linkedin.com/company/quantexa'
WHERE name ILIKE 'Quantexa';

-- STARLING (Starling Bank) — same as Starling Bank entry in Tier 1
-- Skipping duplicate to avoid double-updating; Starling Bank already handled above

-- ============================================================
-- DUPLICATE COMPANY NOTES (no deletes — just flagged)
-- ============================================================
-- 'Slingmoney' and 'Sling Money' — same company (sling.money) — DUPLICATE, review manually
-- 'MNT-Halan' and 'MNT Halan' — same company — both updated above with same data
-- 'Yellow Card' and 'Yellowcard' — same company — DUPLICATE, review manually

COMMIT;
