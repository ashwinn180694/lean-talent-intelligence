-- UAE Tier 2 Fintech Company Enrichment
-- Generated: 2026-06-23
-- Source: Web research across Crunchbase, Tracxn, MENAbytes, Fintech News, company sites

-- 1. Al Futtaim Finance
UPDATE companies SET
  description = 'Financial services division of Al-Futtaim Group providing consumer finance, credit cards, and insurance products across the UAE.',
  founded_year = 1932,
  headquarters = 'Dubai, UAE',
  headcount_range = '5000+',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.alfuttaim.com/brands/al-futtaim-finance/',
  last_enriched_at = now()
WHERE LOWER(name) = 'al futtaim finance';

-- 2. Bankiom
UPDATE companies SET
  description = 'Dubai-based digital neobank targeting millennials with mobile-first banking, payments, wealth management, and remittance services.',
  founded_year = 2018,
  headquarters = 'Dubai, UAE',
  headcount_range = '1-50',
  funding_stage = 'Seed',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.bankiom.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'bankiom';

-- 3. Baraka
UPDATE companies SET
  description = 'UAE-based commission-free investment app enabling retail investors in the GCC to trade US and regional stocks, bonds, options, and gold.',
  founded_year = 2020,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$25M',
  latest_funding_date = NULL,
  key_investors = 'Valar Ventures, Global Founders Capital, VentureSouq',
  website_url = 'https://getbaraka.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'baraka';

-- 4. Botim
UPDATE companies SET
  description = 'UAE super app (owned by Astra Tech) offering free VoIP calls, international money transfers, bill payments, microfinancing, and on-demand services to 150 million users.',
  founded_year = 2018,
  headquarters = 'Abu Dhabi, UAE',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$1B+',
  latest_funding_date = 'Dec 2024',
  key_investors = 'G42, Citi',
  website_url = 'https://botim.me',
  last_enriched_at = now()
WHERE LOWER(name) = 'botim';

-- 5. Bybit
UPDATE companies SET
  description = 'Dubai-headquartered centralized cryptocurrency exchange offering spot, derivatives, and copy trading to retail and institutional clients globally.',
  founded_year = 2018,
  headquarters = 'Dubai, UAE',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = 'Fenbushi Capital, DWF Labs, Hack VC',
  website_url = 'https://www.bybit.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'bybit';

-- 6. CoinMena
UPDATE companies SET
  description = 'Bahrain and UAE-regulated crypto exchange offering Sharia-compliant digital asset trading to retail and institutional investors across MENA.',
  founded_year = 2020,
  headquarters = 'Manama, Bahrain',
  headcount_range = '50-200',
  funding_stage = 'Acquired',
  total_raised = '$9.5M',
  latest_funding_date = NULL,
  key_investors = 'BECO Capital, Kenetic, Arab Bank Switzerland',
  website_url = 'https://www.coinmena.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'coinmena';

-- 7. Coinmama
UPDATE companies SET
  description = 'Global cryptocurrency brokerage founded in Israel enabling users to buy and sell Bitcoin and major altcoins with credit card or bank transfer, now a subsidiary of Wellfield Technologies.',
  founded_year = 2013,
  headquarters = 'Ramat Gan, Israel',
  headcount_range = '50-200',
  funding_stage = 'Acquired',
  total_raised = '$2.4M',
  latest_funding_date = 'Aug 2018',
  key_investors = NULL,
  website_url = 'https://www.coinmama.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'coinmama';

-- 8. Credable (CredibleX)
UPDATE companies SET
  description = 'UAE-based embedded SME lending fintech providing fast working capital to small businesses through a network of distribution partners via Credit-as-a-Service.',
  founded_year = 2023,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$70M',
  latest_funding_date = 'Dec 2024',
  key_investors = 'Further Ventures, Mubadala, Kilgour Williams Capital',
  website_url = 'https://www.crediblex.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'credable';

-- 9. Equiti
UPDATE companies SET
  description = 'Dubai-based global fintech group and regulated broker offering CFD trading across forex, stocks, commodities, and indices via MT4, MT5, and proprietary platforms.',
  founded_year = 2016,
  headquarters = 'Dubai, UAE',
  headcount_range = '200-500',
  funding_stage = 'Bootstrapped',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.equiti.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'equiti';

-- 10. Fasset
UPDATE companies SET
  description = 'UAE-based stablecoin-powered Islamic digital bank serving customers who live and work across borders in emerging markets.',
  founded_year = 2019,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$73M',
  latest_funding_date = 'May 2026',
  key_investors = 'Investcorp, SBI Group, Liberty City Ventures',
  website_url = 'https://www.fasset.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'fasset';

-- 11. Fuze
UPDATE companies SET
  description = 'Dubai-based Digital Assets-as-a-Service (DAaaS) infrastructure platform enabling banks, fintechs, and businesses in MENA and Turkey to offer regulated digital assets.',
  founded_year = 2022,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$26.2M',
  latest_funding_date = 'Jan 2025',
  key_investors = 'Galaxy Digital, e& capital, Further Ventures',
  website_url = 'https://fuze.finance',
  last_enriched_at = now()
WHERE LOWER(name) = 'fuze';

-- 12. Holo
UPDATE companies SET
  description = 'Dubai-based end-to-end digital mortgage platform allowing homebuyers to search, compare, and apply for mortgages from all UAE banks in one place.',
  founded_year = 2020,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$22M',
  latest_funding_date = 'Aug 2025',
  key_investors = 'Impact46, Salica Oryx Fund, Dubai Future District Fund',
  website_url = 'https://www.useholo.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'holo';

-- 13. Hubpay
UPDATE companies SET
  description = 'Abu Dhabi-based cross-border digital wallet and remittance platform connecting migrant worker communities in MENA, Africa, and Asia with dual EMI licensing in UAE and Pakistan.',
  founded_year = 2019,
  headquarters = 'Abu Dhabi, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$26.2M',
  latest_funding_date = 'May 2024',
  key_investors = 'Signal Peak Ventures, BECO Capital, Olive Tree Capital',
  website_url = 'https://hubpay.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'hubpay';

-- 14. Hyperpay
UPDATE companies SET
  description = 'Riyadh-based payment gateway and processing company serving as the leading payments services provider for merchants across the MENA region.',
  founded_year = 2014,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = '$36.7M',
  latest_funding_date = 'May 2022',
  key_investors = 'Mastercard, Amwal Capital Partners, AB Ventures',
  website_url = 'https://www.hyperpay.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'hyperpay';

-- 15. M2
UPDATE companies SET
  description = 'Abu Dhabi-based ADGM-regulated cryptocurrency exchange offering spot trading and digital asset custody for retail and institutional investors globally.',
  founded_year = 2022,
  headquarters = 'Abu Dhabi, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = 'ADQ, Phoenix Group',
  website_url = 'https://www.m2.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'm2';

-- 16. MNT Halan
UPDATE companies SET
  description = 'Egypt-based fintech unicorn and non-bank lender offering microfinance, SME loans, BNPL, payments, and logistics to unbanked and underbanked populations across Egypt, Turkey, UAE, and Pakistan.',
  founded_year = 2017,
  headquarters = 'Cairo, Egypt',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$600M+',
  latest_funding_date = 'Jul 2024',
  key_investors = 'Chimera Investments, IFC, Apis Partners',
  website_url = 'https://mnt-halan.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'mnt halan';

-- 17. Multibank
UPDATE companies SET
  description = 'Dubai-headquartered global online trading group founded in California offering CFDs on forex, stocks, metals, and commodities with over $322M paid-up capital and 26 global offices.',
  founded_year = 2005,
  headquarters = 'Dubai, UAE',
  headcount_range = '500-1000',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.multibankgroup.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'multibank';

-- 18. Now Money
UPDATE companies SET
  description = 'Dubai-based inclusive payroll neobank providing digital banking, payroll disbursement, and remittance services to low-income and blue-collar workers across the GCC.',
  founded_year = 2016,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$13.2M',
  latest_funding_date = 'Jun 2024',
  key_investors = 'Accion Ventures, Commercial Bank of Dubai, DIFC FinTech Fund',
  website_url = 'https://nowmoney.me',
  last_enriched_at = now()
WHERE LOWER(name) = 'now money';

-- 19. Pay10
UPDATE companies SET
  description = 'Dubai-based payments fintech and the first entity to go live on the UAE Central Bank''s Open Finance Framework, offering payment services under RPSCS, SVF, and Open Finance licenses.',
  founded_year = 2017,
  headquarters = 'Dubai, UAE',
  headcount_range = '1-50',
  funding_stage = 'Bootstrapped',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://pay10.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'pay10';

-- 20. Paymob
UPDATE companies SET
  description = 'Cairo-based digital payments infrastructure company enabling businesses across MENA to accept online and in-store payments, serving nearly 350,000 merchants.',
  founded_year = 2015,
  headquarters = 'Cairo, Egypt',
  headcount_range = '500-1000',
  funding_stage = 'Series B',
  total_raised = '$72M',
  latest_funding_date = 'Sep 2024',
  key_investors = 'EBRD Ventures, PayPal Ventures, British International Investment',
  website_url = 'https://paymob.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'paymob';

-- 21. Paysend
UPDATE companies SET
  description = 'London-based global money transfer fintech enabling fast, low-cost international payments to 180 countries for consumers and businesses via app, API, and card rails.',
  founded_year = 2017,
  headquarters = 'London, UK',
  headcount_range = '500-1000',
  funding_stage = 'Series C',
  total_raised = '$252M',
  latest_funding_date = 'Apr 2026',
  key_investors = 'Mastercard, One Peak, Infravia Growth Capital',
  website_url = 'https://paysend.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'paysend';

-- 22. Pemo
UPDATE companies SET
  description = 'Dubai-based corporate spend management platform offering virtual and physical cards with automated expense controls for SMEs across the GCC.',
  founded_year = 2022,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$19M',
  latest_funding_date = 'Nov 2024',
  key_investors = 'Augmentum Fintech, Shorooq Partners, Cherry Ventures',
  website_url = 'https://www.pemo.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'pemo';

-- 23. Plus500
UPDATE companies SET
  description = 'Israel-based publicly listed online trading platform offering CFDs on stocks, ETFs, forex, commodities, and crypto to retail investors worldwide.',
  founded_year = 2008,
  headquarters = 'Haifa, Israel',
  headcount_range = '500-1000',
  funding_stage = 'Public',
  total_raised = NULL,
  latest_funding_date = NULL,
  key_investors = NULL,
  website_url = 'https://www.plus500.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'plus500';

-- 24. Postpay
UPDATE companies SET
  description = 'Dubai-based buy now, pay later platform enabling interest-free instalment payments for online and in-store shoppers across the UAE and broader Middle East.',
  founded_year = 2019,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$35M',
  latest_funding_date = 'Jun 2021',
  key_investors = 'Afterpay, AP Ventures, Commercial Bank of Dubai',
  website_url = 'https://www.postpay.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'postpay';

-- 25. Prypco
UPDATE companies SET
  description = 'Dubai-based proptech and fintech platform offering fractional real estate ownership, digital mortgages, Golden Visas, and exclusive off-plan property access.',
  founded_year = 2022,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$10M+',
  latest_funding_date = 'Oct 2024',
  key_investors = 'Shorooq Partners, General Catalyst, Apparel Group',
  website_url = 'https://prypco.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'prypco';

-- 26. Qashio
UPDATE companies SET
  description = 'Dubai-based B2B spend management platform providing corporate cards, automated expense controls, and embedded financial microservices for SMEs and enterprises across the GCC.',
  founded_year = 2021,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$32.3M',
  latest_funding_date = 'May 2025',
  key_investors = 'Rocketship, 500 Global, ABN Ventures',
  website_url = 'https://qashio.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'qashio';

-- 27. Rain
UPDATE companies SET
  description = 'Bahrain-based regulated cryptocurrency exchange — the first licensed crypto exchange in the Middle East — offering digital asset trading to retail and institutional investors across MENA.',
  founded_year = 2017,
  headquarters = 'Manama, Bahrain',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$116M',
  latest_funding_date = 'Jan 2022',
  key_investors = 'Paradigm, Kleiner Perkins, Coinbase Ventures',
  website_url = 'https://rain.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'rain';

-- 28. Sarwa
UPDATE companies SET
  description = 'Abu Dhabi-based all-in-one investment platform offering automated portfolio management (robo-advisory), self-directed trading, and cash savings products for retail investors in the UAE and MENA.',
  founded_year = 2017,
  headquarters = 'Abu Dhabi, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$25M',
  latest_funding_date = '2021',
  key_investors = 'Mubadala Investment Company, Shorooq Partners, Middle East Venture Partners',
  website_url = 'https://www.sarwa.co',
  last_enriched_at = now()
WHERE LOWER(name) = 'sarwa';

-- 29. Stake
UPDATE companies SET
  description = 'Dubai-based fractional real estate investment platform enabling global investors to co-own Dubai and Saudi income-generating properties from AED 500.',
  founded_year = 2020,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$45M',
  latest_funding_date = 'Jun 2024',
  key_investors = 'MEVP, Mubadala Investment Company, Aramco Wa''ed Ventures',
  website_url = 'https://getstake.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'stake';

-- 30. Stashaway
UPDATE companies SET
  description = 'Singapore-based digital wealth management platform and robo-advisor offering automated investment portfolios, smart cash management, and thematic investing across Asia and MENA.',
  founded_year = 2016,
  headquarters = 'Singapore, Singapore',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$75.3M',
  latest_funding_date = 'Jul 2021',
  key_investors = 'Eight Roads Ventures, Peak XV Partners, United Networks Limited',
  website_url = 'https://www.stashaway.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'stashaway';

-- 31. Thndr
UPDATE companies SET
  description = 'Cairo-based commission-free digital investment app enabling Egyptian and GCC retail investors to trade stocks, bonds, mutual funds, and gold with no minimum deposit.',
  founded_year = 2020,
  headquarters = 'Cairo, Egypt',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$37.76M',
  latest_funding_date = 'May 2025',
  key_investors = 'Prosus, Y Combinator, BECO Capital',
  website_url = 'https://thndr.app',
  last_enriched_at = now()
WHERE LOWER(name) = 'thndr';

-- 32. Tiqmo
UPDATE companies SET
  description = 'Riyadh-based digital payments and lifestyle app offering a mobile wallet, global money transfers, Mastercard-linked cards, and a services marketplace across KSA and the UAE.',
  founded_year = 2020,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '50-200',
  funding_stage = 'Seed',
  total_raised = 'Undisclosed',
  latest_funding_date = NULL,
  key_investors = 'Ajlan & Bros, SwiftPass',
  website_url = 'https://tiqmo.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'tiqmo';

-- 33. Verity
UPDATE companies SET
  description = 'Dubai-based fintech startup offering a family banking and financial literacy app with prepaid debit cards and reward tools to help children aged 8-18 develop money management skills.',
  founded_year = 2021,
  headquarters = 'Dubai, UAE',
  headcount_range = '1-50',
  funding_stage = 'Seed',
  total_raised = '$1.2M',
  latest_funding_date = '2022',
  key_investors = 'Wamda, VentureSouq, Beyond Capital',
  website_url = NULL,
  last_enriched_at = now()
WHERE LOWER(name) = 'verity';

-- 34. Zand
UPDATE companies SET
  description = 'Dubai-based UAE''s first fully licensed all-digital bank for retail and corporate clients, offering AI-powered banking and pioneering institutional-grade digital asset custody services.',
  founded_year = 2018,
  headquarters = 'Dubai, UAE',
  headcount_range = '200-500',
  funding_stage = 'Seed',
  total_raised = 'Undisclosed',
  latest_funding_date = 'Feb 2022',
  key_investors = 'Franklin Templeton, Aditya Birla Group, Lulu Group',
  website_url = 'https://www.zand.ae',
  last_enriched_at = now()
WHERE LOWER(name) = 'zand';

-- 35. Crypto.com
UPDATE companies SET
  description = 'Singapore-based global cryptocurrency exchange and fintech platform offering trading, DeFi wallet, NFT marketplace, crypto cards, and payments to over 100 million users worldwide.',
  founded_year = 2016,
  headquarters = 'Singapore, Singapore',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$38M',
  latest_funding_date = NULL,
  key_investors = 'DST Global, IDG Capital, YZi Labs',
  website_url = 'https://crypto.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'crypto.com';
