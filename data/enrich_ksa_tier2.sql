-- KSA Tier 2 Fintech Company Enrichment
-- Generated: 2026-06-23
-- Source: Web research via multiple fintech databases and news sources

-- 1. Alinma Bank
UPDATE companies SET
  description = 'A Saudi Islamic commercial bank established with government-backed shareholders offering retail, corporate, and investment banking services.',
  founded_year = 2006,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Public Investment Fund (PIF), Public Pension Agency, GOSI',
  website_url = 'https://www.alinma.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'alinma';

-- 2. Alinma Pay
UPDATE companies SET
  description = 'A digital wallet and mobile payments subsidiary of Alinma Bank offering wallet-based transfers, bill payments, and online purchasing in Saudi Arabia.',
  founded_year = 2019,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Alinma Bank (parent)',
  website_url = 'https://www.alinma.com/en',
  last_enriched_at = now()
WHERE LOWER(name) = 'alinma pay';

-- 3. Amlak International
UPDATE companies SET
  description = 'Saudi Arabia's first licensed real estate financing company offering Sharia-compliant mortgage and corporate financing solutions.',
  founded_year = 2007,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Public',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Saudi Investment Bank (SAIB)',
  website_url = 'https://www.amlakint.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'amlak international';

-- 4. Bijal
UPDATE companies SET
  description = NULL,
  founded_year = NULL,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = NULL,
  funding_stage = NULL,
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = NULL,
  last_enriched_at = now()
WHERE LOWER(name) = 'bijal';

-- 5. Buildnow
UPDATE companies SET
  description = 'A Saudi build-now-pay-later platform that provides construction and manufacturing SMEs with raw material financing and flexible credit terms.',
  founded_year = 2022,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1-50',
  funding_stage = 'Seed',
  total_raised = '$19M',
  latest_funding_date = 'Feb 2025',
  key_investors = 'STV, Arbah Capital, Raed Ventures',
  website_url = 'https://www.buildnow.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'buildnow';

-- 6. Ekar
UPDATE companies SET
  description = 'A Middle East self-drive mobility platform enabling users to rent cars by the minute, hour, or day through a mobile app in UAE and Saudi Arabia.',
  founded_year = 2016,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$50M',
  latest_funding_date = NULL,
  key_investors = 'Polymath Ventures, Al Yemni Group, Audacia Capital',
  website_url = 'https://www.ekar.app',
  last_enriched_at = now()
WHERE LOWER(name) = 'ekar';

-- 7. Enjaz
UPDATE companies SET
  description = 'The remittance and digital wallet division of Bank Albilad providing international and local money transfer services across Saudi Arabia.',
  founded_year = 2004,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Bank Albilad (parent)',
  website_url = 'https://www.enjaz.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'enjaz';

-- 8. FOODICS
UPDATE companies SET
  description = 'A Saudi cloud-based restaurant management and POS platform that provides fintech tools, payments, and business intelligence to F&B merchants across MENA.',
  founded_year = 2014,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '500-1000',
  funding_stage = 'Series C',
  total_raised = '$198M',
  latest_funding_date = 'Apr 2022',
  key_investors = 'Prosus, Sanabil Investments, Sequoia Capital India',
  website_url = 'https://www.foodics.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'foodics';

-- 9. Foodics Pay
UPDATE companies SET
  description = 'The embedded payments product of Foodics enabling Saudi F&B and retail merchants to accept card payments via a dedicated POS device.',
  founded_year = 2014,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Series C',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Foodics (parent)',
  website_url = 'https://www.foodics.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'foodics pay';

-- 10. Friendi Pay
UPDATE companies SET
  description = 'A digital mobile wallet for international remittances launched by Beyond ONE for FRiENDi Mobile subscribers in Saudi Arabia.',
  founded_year = 2023,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1-50',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Beyond ONE (parent)',
  website_url = NULL,
  last_enriched_at = now()
WHERE LOWER(name) = 'friendi pay';

-- 11. Hala
UPDATE companies SET
  description = 'A Saudi embedded finance platform offering business accounts, corporate cards, payment gateways, POS, and lending products for SMEs and freelancers.',
  founded_year = 2018,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = '$170M',
  latest_funding_date = 'Sep 2025',
  key_investors = 'TPG Rise Fund, Sanabil Investments, QED Investors',
  website_url = 'https://hala.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'hala';

-- 12. Jahez
UPDATE companies SET
  description = 'Saudi Arabia's largest locally-owned food delivery platform, the first Saudi tech startup to IPO, with operations across 47 cities.',
  founded_year = 2016,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = '$36.5M',
  latest_funding_date = NULL,
  key_investors = 'Impact46',
  website_url = 'https://www.jahez.net',
  last_enriched_at = now()
WHERE LOWER(name) = 'jahez';

-- 13. Lendo
UPDATE companies SET
  description = 'A Saudi Sharia-compliant P2P digital lending marketplace that helps businesses pre-finance outstanding invoices and access SME financing.',
  founded_year = 2019,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$35M',
  latest_funding_date = 'Dec 2023',
  key_investors = 'Sanabil Investments, Shorooq Partners, 500 Global',
  website_url = 'https://www.lendo.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'lendo';

-- 14. Lucidya
UPDATE companies SET
  description = 'A Saudi AI platform specializing in Arabic-language customer experience analytics and digital workforce solutions for enterprises.',
  founded_year = 2016,
  headquarters = 'Jeddah, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$38M',
  latest_funding_date = 'Jul 2025',
  key_investors = 'Impact46, Wa''ed Ventures, Rua Growth Fund',
  website_url = 'https://www.lucidya.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'lucidya';

-- 15. Madfu
UPDATE companies SET
  description = 'A Saudi Sharia-compliant BNPL platform enabling consumers to split purchases into up to six interest-free installments.',
  founded_year = 2022,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$25.5M',
  latest_funding_date = 'Feb 2026',
  key_investors = 'Afaq Capital',
  website_url = 'https://www.madfu.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'madfu';

-- 16. Mobily
UPDATE companies SET
  description = 'Saudi Arabia's second-largest telecom operator (Etihad Etisalat) offering mobile, fixed-line, and internet services with growing fintech and digital payment capabilities.',
  founded_year = 2004,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Etisalat Emirates Group, GOSI',
  website_url = 'https://www.mobily.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'mobily';

-- 17. Mozn
UPDATE companies SET
  description = 'A Saudi AI company delivering enterprise-grade data analytics, Arabic NLP, and financial intelligence solutions to help organizations make data-driven decisions.',
  founded_year = 2017,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$30M',
  latest_funding_date = 'Feb 2022',
  key_investors = 'Raed Ventures, Sanabil Investments, Shorooq Partners',
  website_url = 'https://www.mozn.ai',
  last_enriched_at = now()
WHERE LOWER(name) = 'mozn';

-- 18. MyFatoorah (myatooorah)
UPDATE companies SET
  description = 'A Kuwait-based payment gateway providing online payment solutions, electronic invoicing, and financial operations tools for merchants across the GCC and MENA.',
  founded_year = 2015,
  headquarters = 'Kuwait City, Kuwait',
  headcount_range = '50-200',
  funding_stage = 'Bootstrapped',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.myfatoorah.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'myatooorah';

-- 19. Neoleap
UPDATE companies SET
  description = 'A Saudi fintech subsidiary of Al Rajhi Bank offering digital wallets, payment gateways, POS solutions, and e-commerce payment tools for financial inclusion.',
  founded_year = 2021,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Al Rajhi Bank (parent)',
  website_url = 'https://www.neoleap.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'neoleap';

-- 20. Payfabs
UPDATE companies SET
  description = NULL,
  founded_year = NULL,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = NULL,
  funding_stage = NULL,
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = NULL,
  last_enriched_at = now()
WHERE LOWER(name) = 'payfabs';

-- 21. Rab
UPDATE companies SET
  description = 'A Saudi fintech crowdfunding and equity exchange platform using AI to connect investors with businesses and facilitate funding decisions.',
  founded_year = 2019,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1-50',
  funding_stage = 'Seed',
  total_raised = '$799K',
  latest_funding_date = NULL,
  key_investors = 'Mjalis Investment Company',
  website_url = 'https://www.rabeh.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'rab';

-- 22. Salla
UPDATE companies SET
  description = 'A Saudi SaaS e-commerce enablement platform that helps merchants build and run online stores with integrated payments, shipping, and marketplace tools.',
  founded_year = 2016,
  headquarters = 'Jeddah, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = '$139M',
  latest_funding_date = 'Mar 2024',
  key_investors = 'Investcorp, Sanabil Investments, STV',
  website_url = 'https://salla.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'salla';

-- 23. Sarie
UPDATE companies SET
  description = 'Saudi Arabia's national instant payment system operated by Saudi Payments under SAMA supervision, enabling 24/7 real-time low-value fund transfers between bank accounts.',
  founded_year = 2021,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'SAMA / Saudi Payments (government-owned)',
  website_url = 'https://www.saudipaymentsco.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'sarie';

-- 24. Sary
UPDATE companies SET
  description = 'A Saudi B2B e-commerce marketplace connecting small businesses and retailers with wholesalers and FMCG brands through mobile and web platforms.',
  founded_year = 2018,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series C',
  total_raised = '$112M',
  latest_funding_date = 'Dec 2021',
  key_investors = 'Sanabil Investments, STV, Wafra International Investment',
  website_url = 'https://sary.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'sary';

-- 25. SiFi
UPDATE companies SET
  description = 'A Saudi spend management fintech providing smart corporate cards, real-time spending insights, and automated expense workflows for businesses.',
  founded_year = 2021,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$34M',
  latest_funding_date = 'Feb 2026',
  key_investors = 'Ra''ed Ventures, Sanabil Investments',
  website_url = 'https://sifi.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'sifi';

-- 26. Tahweel Al Rajhi
UPDATE companies SET
  description = 'The remittance arm of Al Rajhi Bank operating a network of over 230 centers in Saudi Arabia for international and local money transfers to 200+ countries.',
  founded_year = NULL,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Al Rajhi Bank (parent)',
  website_url = 'https://www.tahweelalrajhi.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'tahweel al rajhi';

-- 27. Tamam
UPDATE companies SET
  description = 'A Saudi consumer micro-financing fintech and subsidiary of Zain KSA, offering the Kingdom's first fully digital Sharia-compliant micro-loan product via mobile app.',
  founded_year = 2019,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Zain KSA (parent)',
  website_url = 'https://tamam.life',
  last_enriched_at = now()
WHERE LOWER(name) = 'tamam';

-- 28. Tap (Tap Payments)
UPDATE companies SET
  description = 'A Kuwait-headquartered payment gateway and technology provider enabling online and in-app payment acceptance for merchants across the MENA region.',
  founded_year = 2013,
  headquarters = 'Kuwait City, Kuwait',
  headcount_range = '200-500',
  funding_stage = 'Seed',
  total_raised = '$2M',
  latest_funding_date = 'Jan 2025',
  key_investors = 'Wamda Capital, The World Bank',
  website_url = 'https://www.tap.company',
  last_enriched_at = now()
WHERE LOWER(name) = 'tap';

-- 29. Telr
UPDATE companies SET
  description = 'A Dubai-based payment gateway serving UAE and Saudi Arabia, offering online payment processing and multi-currency acceptance for businesses.',
  founded_year = 2014,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$29M',
  latest_funding_date = NULL,
  key_investors = 'iMena, Cashfree Payments',
  website_url = 'https://telr.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'telr';

-- 30. Urpay
UPDATE companies SET
  description = 'A Saudi digital wallet by Al Rajhi Bank's Neoleap subsidiary enabling cashless transactions, international remittances, bill payments, and merchant rewards.',
  founded_year = 2022,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = 'Al Rajhi Bank / Neoleap (parent)',
  website_url = 'https://www.urpay.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'urpay';

-- 31. Zid
UPDATE companies SET
  description = 'A Saudi e-commerce enablement platform providing omnichannel SaaS tools including online store builder, payments, POS, shipping, and marketplace services for retailers.',
  founded_year = 2017,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = '$59M',
  latest_funding_date = 'Oct 2022',
  key_investors = 'L Catterton Growth, Global Ventures, Earlybird Venture Capital',
  website_url = 'https://zid.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'zid';
