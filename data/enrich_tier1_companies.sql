-- =============================================================================
-- Tier 1 Company Enrichment Data
-- Generated: 2026-06-23
-- Source: Web research (Crunchbase, PitchBook, Wikipedia, company sites, news)
-- =============================================================================


-- =============================================================================
-- PAYMENT INFRASTRUCTURE & PROCESSORS
-- =============================================================================

UPDATE companies SET
  description = 'Payment infrastructure platform that enables businesses to accept payments and manage money globally via APIs.',
  founded_year = 2010,
  headquarters = 'San Francisco, USA',
  headcount_range = '5000+',
  funding_stage = 'Series D+',
  total_raised = '$9.4B',
  latest_funding_date = 'Feb 2025',
  key_investors = 'Sequoia Capital, Andreessen Horowitz, General Catalyst',
  website_url = 'https://stripe.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'stripe';

UPDATE companies SET
  description = 'Global unified payments platform enabling businesses to accept and process payments in-store, online, and via mobile.',
  founded_year = 2006,
  headquarters = 'Amsterdam, Netherlands',
  headcount_range = '5000+',
  funding_stage = 'Public',
  total_raised = 'N/A (bootstrapped to IPO)',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.adyen.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'adyen';

UPDATE companies SET
  description = 'Global financial infrastructure platform enabling businesses to manage payments, treasury, and financial operations across borders.',
  founded_year = 2015,
  headquarters = 'Melbourne, Australia',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$900M+',
  latest_funding_date = 'Nov 2024',
  key_investors = 'Addition, T. Rowe Price, Sequoia Capital',
  website_url = 'https://www.airwallex.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'airwallex';

UPDATE companies SET
  description = 'Open banking payments network enabling businesses to accept instant bank payments via a single API integration.',
  founded_year = 2012,
  headquarters = 'London, UK',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$1.7B',
  latest_funding_date = 'Sep 2022',
  key_investors = 'Insight Partners, GIC, Stripe',
  website_url = 'https://checkout.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'checkout.com';

UPDATE companies SET
  description = 'Enterprise payment orchestration platform helping global businesses optimize complex payment flows and maximize performance.',
  founded_year = 2021,
  headquarters = 'Berlin, Germany',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$52M',
  latest_funding_date = 'Jun 2025',
  key_investors = 'Andreessen Horowitz, HV Capital, EQT Ventures',
  website_url = 'https://www.payrails.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'payrails';

UPDATE companies SET
  description = 'Unified payment infrastructure platform allowing merchants to connect payment services and build custom checkout flows without code.',
  founded_year = 2019,
  headquarters = 'London, UK',
  headcount_range = '200-500',
  funding_stage = 'Series C',
  total_raised = '$174M',
  latest_funding_date = 'Nov 2024',
  key_investors = 'Accel, Balderton Capital, ICONIQ Growth',
  website_url = 'https://primer.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'primer';

UPDATE companies SET
  description = 'Global fintech infrastructure company providing payment-as-a-service solutions including card acquiring, local payment methods, and multi-currency wallets.',
  founded_year = 2016,
  headquarters = 'London, UK',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$1.0B',
  latest_funding_date = 'Mar 2025',
  key_investors = 'General Catalyst, Coatue, Tiger Global',
  website_url = 'https://www.rapyd.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'rapyd';

UPDATE companies SET
  description = 'Payment technology company providing modular infrastructure for e-commerce platforms and online marketplaces.',
  founded_year = 2013,
  headquarters = 'Luxembourg, Luxembourg',
  headcount_range = '200-500',
  funding_stage = 'Acquired',
  total_raised = '$75M',
  latest_funding_date = 'Apr 2022',
  key_investors = 'Advent International',
  website_url = 'https://mangopay.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'mangopay';

UPDATE companies SET
  description = 'Global payments platform providing local payment method infrastructure for international businesses.',
  founded_year = 2006,
  headquarters = 'London, UK',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$463M',
  latest_funding_date = 'Jan 2021',
  key_investors = 'PayPal Ventures, Citi Ventures, Sprints Capital',
  website_url = 'https://www.ppro.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'ppro';

UPDATE companies SET
  description = 'Payment technology company offering processing, acquiring, and risk management solutions with a focus on regulated industries.',
  founded_year = 2003,
  headquarters = 'Montreal, Canada',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$358M',
  latest_funding_date = 'Dec 2019',
  key_investors = 'Novacap, CDPQ',
  website_url = 'https://www.nuvei.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'nuvei';

UPDATE companies SET
  description = 'Global payments platform with expertise in digital payments, eCash, and digital wallets for online gaming, e-commerce, and fintech.',
  founded_year = 1996,
  headquarters = 'London, UK',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = 'N/A (public)',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.paysafe.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'paysafe';


-- =============================================================================
-- OPEN BANKING & BANK-TO-BANK PAYMENTS
-- =============================================================================

UPDATE companies SET
  description = 'Open banking platform enabling developers to build products with access to banking data and payment initiation.',
  founded_year = 2016,
  headquarters = 'London, UK',
  headcount_range = '200-500',
  funding_stage = 'Series E',
  total_raised = '$322M',
  latest_funding_date = 'Sep 2021',
  key_investors = 'Northzone, Temasek, Anthemis Group',
  website_url = 'https://truelayer.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'truelayer';

UPDATE companies SET
  description = 'Open banking platform acquired by Visa that provides financial data connectivity and payment initiation across Europe.',
  founded_year = 2012,
  headquarters = 'Stockholm, Sweden',
  headcount_range = '200-500',
  funding_stage = 'Acquired',
  total_raised = '$110M',
  latest_funding_date = 'Jan 2020',
  key_investors = 'Visa',
  website_url = 'https://tink.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'tink';

UPDATE companies SET
  description = 'Open banking API platform providing financial data access and payment initiation to fintechs and financial services companies.',
  founded_year = 2017,
  headquarters = 'London, UK',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$71M',
  latest_funding_date = 'Jun 2021',
  key_investors = 'Lakestar, Sapphire Ventures, LocalGlobe',
  website_url = 'https://www.yapily.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'yapily';

UPDATE companies SET
  description = 'Bank payment network enabling businesses to collect recurring and one-off payments directly from customers\' bank accounts.',
  founded_year = 2011,
  headquarters = 'London, UK',
  headcount_range = '500-1000',
  funding_stage = 'Acquired',
  total_raised = '$540M',
  latest_funding_date = 'Dec 2021',
  key_investors = 'Accel, Bain Capital Ventures, Google Ventures',
  website_url = 'https://gocardless.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'gocardless';

UPDATE companies SET
  description = 'Open banking payment network processing bank-to-bank payments for merchants and financial institutions across Europe and the US.',
  founded_year = 2008,
  headquarters = 'Stockholm, Sweden',
  headcount_range = '500-1000',
  funding_stage = 'Acquired',
  total_raised = 'Undisclosed',
  latest_funding_date = 'Mar 2018',
  key_investors = 'Nordic Capital, BlackRock, Aberdeen',
  website_url = 'https://www.trustly.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'trustly';

UPDATE companies SET
  description = 'Real-time payments network building global instant payment infrastructure for merchants and financial institutions.',
  founded_year = 2019,
  headquarters = 'London, UK',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$84M',
  latest_funding_date = 'Jun 2023',
  key_investors = 'IVP, EQT Ventures, Augmentum Fintech',
  website_url = 'https://www.volt.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'volt';

UPDATE companies SET
  description = 'Financial data network connecting applications to users\' bank accounts for payments, lending, and personal finance.',
  founded_year = 2013,
  headquarters = 'San Francisco, USA',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$1.3B',
  latest_funding_date = 'Apr 2025',
  key_investors = 'Andreessen Horowitz, Goldman Sachs, JPMorgan',
  website_url = 'https://plaid.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'plaid';


-- =============================================================================
-- CONSUMER & SME FINTECH
-- =============================================================================

UPDATE companies SET
  description = 'Digital neobank offering multi-currency accounts, international money transfers, and financial services to over 50 million customers globally.',
  founded_year = 2015,
  headquarters = 'London, UK',
  headcount_range = '5000+',
  funding_stage = 'Series D+',
  total_raised = '$5.9B',
  latest_funding_date = 'Nov 2025',
  key_investors = 'Coatue, Greenoaks, Andreessen Horowitz',
  website_url = 'https://www.revolut.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'revolut';

UPDATE companies SET
  description = 'Buy now, pay later platform offering consumers flexible payment plans at checkout while providing merchants with instant payment.',
  founded_year = 2005,
  headquarters = 'Stockholm, Sweden',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = '$4.5B',
  latest_funding_date = 'Sep 2025',
  key_investors = 'Sequoia Capital, Silver Lake, Permira',
  website_url = 'https://www.klarna.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'klarna';

UPDATE companies SET
  description = 'European payment service provider offering online and in-person payment solutions for SMEs and enterprise businesses.',
  founded_year = 2004,
  headquarters = 'Amsterdam, Netherlands',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$940M',
  latest_funding_date = 'Jun 2021',
  key_investors = 'Blackstone, TCV',
  website_url = 'https://www.mollie.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'mollie';

UPDATE companies SET
  description = 'International money transfer service allowing consumers and businesses to send money internationally at low cost and transparent fees.',
  founded_year = 2011,
  headquarters = 'London, UK',
  headcount_range = '5000+',
  funding_stage = 'Public',
  total_raised = '$1.0B',
  latest_funding_date = 'Jul 2021',
  key_investors = 'Andreessen Horowitz, BlackRock, Vanguard',
  website_url = 'https://wise.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'wise';

UPDATE companies SET
  description = 'Smart spend management platform providing corporate cards and expense management software for businesses.',
  founded_year = 2015,
  headquarters = 'Copenhagen, Denmark',
  headcount_range = '500-1000',
  funding_stage = 'Series C',
  total_raised = '$434M',
  latest_funding_date = 'May 2024',
  key_investors = 'Bain Capital Ventures, Thrive Capital, Creandum',
  website_url = 'https://www.pleo.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'pleo';

UPDATE companies SET
  description = 'AI-powered corporate card and expense management platform for startups and global enterprises.',
  founded_year = 2017,
  headquarters = 'San Francisco, USA',
  headcount_range = '1000-5000',
  funding_stage = 'Acquired',
  total_raised = '$1.5B',
  latest_funding_date = 'Jan 2022',
  key_investors = 'Greenoaks Capital, DST Global, Kleiner Perkins',
  website_url = 'https://www.brex.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'brex';


-- =============================================================================
-- CROSS-BORDER & REMITTANCE
-- =============================================================================

UPDATE companies SET
  description = 'Global money movement platform enabling businesses to send and receive payments across 220+ countries through a single API.',
  founded_year = 2014,
  headquarters = 'Singapore, Singapore',
  headcount_range = '500-1000',
  funding_stage = 'Series E',
  total_raised = '$312M',
  latest_funding_date = 'Jun 2024',
  key_investors = 'Visa, Riverwood Capital, Temasek',
  website_url = 'https://www.nium.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'nium';

UPDATE companies SET
  description = 'Cross-border payments network connecting mobile wallets, banks, and payment providers across 130+ countries for real-time transfers.',
  founded_year = 2016,
  headquarters = 'Singapore, Singapore',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$362M',
  latest_funding_date = '2024',
  key_investors = 'Apis Partners, Vitruvian Partners, Insight Partners',
  website_url = 'https://www.thunes.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'thunes';

UPDATE companies SET
  description = 'Global money transfer company providing digital cross-border remittances through two brands: WorldRemit and Sendwave.',
  founded_year = 2010,
  headquarters = 'London, UK',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$900M+',
  latest_funding_date = 'Oct 2024',
  key_investors = 'Accel, TCV, Leapfrog Investments',
  website_url = 'https://zepz.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'zepz';

UPDATE companies SET
  description = 'Global money transfer operator providing consumer and business payment services across 200+ countries.',
  founded_year = 1851,
  headquarters = 'Denver, USA',
  headcount_range = '5000+',
  funding_stage = 'Public',
  total_raised = 'N/A (public)',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.westernunion.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'western union';

UPDATE companies SET
  description = 'Global money transfer company providing international payment services to consumers and businesses in over 200 countries.',
  founded_year = 1940,
  headquarters = 'Dallas, USA',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$1.8B',
  latest_funding_date = 'Jun 2023',
  key_investors = 'Madison Dearborn Partners',
  website_url = 'https://www.moneygram.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'moneygram';


-- =============================================================================
-- CLOUD BANKING & CORE BANKING
-- =============================================================================

UPDATE companies SET
  description = 'Cloud-native banking platform providing SaaS core banking infrastructure for banks, lenders, and fintechs.',
  founded_year = 2011,
  headquarters = 'Berlin, Germany',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$446M',
  latest_funding_date = 'Jan 2022',
  key_investors = 'Bessemer Venture Partners, TCV, Runa Capital',
  website_url = 'https://mambu.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'mambu';

UPDATE companies SET
  description = 'Cloud-based core banking and digital finance software platform serving over 3,000 financial institutions in 145 countries.',
  founded_year = 1993,
  headquarters = 'Geneva, Switzerland',
  headcount_range = '5000+',
  funding_stage = 'Public',
  total_raised = 'N/A (public)',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.temenos.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'temenos';


-- =============================================================================
-- CRYPTO INFRASTRUCTURE & EXCHANGES
-- =============================================================================

UPDATE companies SET
  description = 'Enterprise blockchain network and payment protocol enabling real-time cross-border money transfers using XRP digital currency.',
  founded_year = 2012,
  headquarters = 'San Francisco, USA',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$1.0B',
  latest_funding_date = '2023',
  key_investors = 'Andreessen Horowitz, Tetragon, SBI Group',
  website_url = 'https://ripple.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'ripple';

UPDATE companies SET
  description = 'Financial technology company and issuer of USDC stablecoin enabling digital dollar payments and programmable money.',
  founded_year = 2013,
  headquarters = 'New York, USA',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = '$1.99B',
  latest_funding_date = 'Jun 2025',
  key_investors = 'General Catalyst, IDG Capital, Breyer Capital',
  website_url = 'https://www.circle.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'circle';

UPDATE companies SET
  description = 'Cryptocurrency payment and NFT infrastructure platform enabling consumers to buy, sell, and spend digital assets.',
  founded_year = 2019,
  headquarters = 'New York, USA',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$807M',
  latest_funding_date = 'Mar 2025',
  key_investors = 'Tiger Global, Coatue, Paradigm',
  website_url = 'https://www.moonpay.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'moonpay';

UPDATE companies SET
  description = 'World\'s largest cryptocurrency exchange by trading volume offering spot, futures, and institutional trading services.',
  founded_year = 2017,
  headquarters = 'Dubai, UAE',
  headcount_range = '5000+',
  funding_stage = 'Bootstrapped',
  total_raised = '$15M (ICO)',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.binance.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'binance';

UPDATE companies SET
  description = 'US-based cryptocurrency exchange offering spot trading, futures, staking, and custody services for retail and institutional clients.',
  founded_year = 2011,
  headquarters = 'San Francisco, USA',
  headcount_range = '1000-5000',
  funding_stage = 'Series D+',
  total_raised = '$1.3B',
  latest_funding_date = 'Sep 2025',
  key_investors = 'Sequoia Capital, Tribe Capital, Jane Street',
  website_url = 'https://www.kraken.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'kraken';

UPDATE companies SET
  description = 'Global cryptocurrency exchange and Web3 technology company offering trading, wallets, and DeFi services.',
  founded_year = 2013,
  headquarters = 'San Jose, USA',
  headcount_range = '5000+',
  funding_stage = 'Bootstrapped',
  total_raised = 'Undisclosed',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.okx.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'okx';

UPDATE companies SET
  description = 'Stablecoin issuer and operator of USDT, the world\'s largest stablecoin by market capitalization.',
  founded_year = 2014,
  headquarters = 'El Salvador, El Salvador',
  headcount_range = '200-500',
  funding_stage = 'Bootstrapped',
  total_raised = 'Undisclosed',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://tether.to',
  last_enriched_at = now()
WHERE LOWER(name) = 'tether';

UPDATE companies SET
  description = 'Crypto-native yield-bearing stablecoin protocol issuing delta-neutral synthetic dollars backed by Ethereum derivatives.',
  founded_year = 2023,
  headquarters = 'Lisbon, Portugal',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$156M',
  latest_funding_date = 'Sep 2025',
  key_investors = 'Dragonfly Capital, Kraken, Brevan Howard',
  website_url = 'https://ethena.fi',
  last_enriched_at = now()
WHERE LOWER(name) = 'ethena';

UPDATE companies SET
  description = 'Decentralized non-custodial liquidity protocol enabling users to lend, borrow, and earn interest on crypto assets.',
  founded_year = 2017,
  headquarters = 'London, UK',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$16M (ICO)',
  latest_funding_date = 'Jul 2017',
  key_investors = null,
  website_url = 'https://aave.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'aave';

UPDATE companies SET
  description = 'Blockchain analytics company providing compliance, investigation, and risk management tools to governments, banks, and businesses.',
  founded_year = 2014,
  headquarters = 'New York, USA',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$538M',
  latest_funding_date = 'Oct 2025',
  key_investors = 'Accel, Haun Ventures, Benchmark',
  website_url = 'https://www.chainalysis.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'chainalysis';

UPDATE companies SET
  description = 'Digital asset custody, infrastructure, and financial services company serving institutional investors worldwide.',
  founded_year = 2013,
  headquarters = 'Palo Alto, USA',
  headcount_range = '200-500',
  funding_stage = 'Public',
  total_raised = '$170M',
  latest_funding_date = 'Jan 2026',
  key_investors = 'Goldman Sachs, Redpoint Ventures, Craft Ventures',
  website_url = 'https://www.bitgo.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'bitgo';

UPDATE companies SET
  description = 'Institutional digital asset security platform enabling financial institutions to store, transfer, and manage crypto assets at scale.',
  founded_year = 2018,
  headquarters = 'New York, USA',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$1.0B',
  latest_funding_date = 'Jan 2022',
  key_investors = 'Sequoia Capital, Spark Capital, Coatue',
  website_url = 'https://www.fireblocks.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'fireblocks';

UPDATE companies SET
  description = 'Crypto-native stablecoin payment infrastructure platform enabling businesses to send, receive, and manage stablecoin payments globally.',
  founded_year = 2021,
  headquarters = 'London, UK',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$90M',
  latest_funding_date = 'Dec 2024',
  key_investors = 'Haun Ventures, Coinbase Ventures, Tiger Global',
  website_url = 'https://bvnk.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'bvnk';

UPDATE companies SET
  description = 'Self-custody multichain crypto wallet and consumer finance platform with over 10 million users across Solana, Ethereum, and Bitcoin.',
  founded_year = 2021,
  headquarters = 'San Francisco, USA',
  headcount_range = '200-500',
  funding_stage = 'Series C',
  total_raised = '$268M',
  latest_funding_date = 'Jan 2025',
  key_investors = 'Sequoia Capital, Paradigm, Andreessen Horowitz',
  website_url = 'https://phantom.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'phantom';

UPDATE companies SET
  description = 'Decentralized exchange protocol and automated market maker enabling permissionless crypto token swaps on Ethereum and other chains.',
  founded_year = 2018,
  headquarters = 'New York, USA',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = '$178M',
  latest_funding_date = 'Oct 2022',
  key_investors = 'Andreessen Horowitz, Paradigm, Polychain Capital',
  website_url = 'https://uniswap.org',
  last_enriched_at = now()
WHERE LOWER(name) = 'uniswap';

UPDATE companies SET
  description = 'Ethereum-compatible blockchain scaling platform providing high-throughput, low-cost infrastructure for Web3 applications and payments.',
  founded_year = 2017,
  headquarters = 'Cayman Islands',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = '$451M',
  latest_funding_date = '2022',
  key_investors = 'Sequoia Capital, Tiger Global, SoftBank',
  website_url = 'https://polygon.technology',
  last_enriched_at = now()
WHERE LOWER(name) = 'polygon';

UPDATE companies SET
  description = 'Decentralized oracle network providing tamper-proof real-world data feeds to smart contracts on any blockchain.',
  founded_year = 2017,
  headquarters = 'San Francisco, USA',
  headcount_range = '200-500',
  funding_stage = 'Bootstrapped',
  total_raised = '$32M (ICO)',
  latest_funding_date = 'Sep 2017',
  key_investors = null,
  website_url = 'https://chain.link',
  last_enriched_at = now()
WHERE LOWER(name) = 'chainlink';

UPDATE companies SET
  description = 'Layer-1 blockchain network developer building scalable, developer-friendly infrastructure for decentralized applications.',
  founded_year = 2021,
  headquarters = 'Palo Alto, USA',
  headcount_range = '200-500',
  funding_stage = 'Series C',
  total_raised = '$410M',
  latest_funding_date = '2023',
  key_investors = 'Andreessen Horowitz, Jump Crypto, Multicoin Capital',
  website_url = 'https://aptoslabs.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'aptos labs';

UPDATE companies SET
  description = 'High-performance Layer-1 blockchain platform (Ava Labs) enabling fast, low-cost smart contracts and custom blockchain deployments.',
  founded_year = 2018,
  headquarters = 'New York, USA',
  headcount_range = '200-500',
  funding_stage = 'Series C',
  total_raised = '$356M',
  latest_funding_date = '2022',
  key_investors = 'Andreessen Horowitz, Polychain Capital, Initialized Capital',
  website_url = 'https://www.avax.network',
  last_enriched_at = now()
WHERE LOWER(name) = 'avalanche';

UPDATE companies SET
  description = 'Omnichain interoperability protocol enabling decentralized applications to communicate and transfer assets across any blockchain.',
  founded_year = 2021,
  headquarters = 'Vancouver, Canada',
  headcount_range = '50-200',
  funding_stage = 'Series B',
  total_raised = '$318M',
  latest_funding_date = 'Apr 2025',
  key_investors = 'Andreessen Horowitz, Sequoia Capital, FTX Ventures',
  website_url = 'https://layerzero.network',
  last_enriched_at = now()
WHERE LOWER(name) = 'layerzero';


-- =============================================================================
-- MENA / REGIONAL FINTECHS
-- =============================================================================

UPDATE companies SET
  description = 'BNPL and shopping platform enabling consumers in the Middle East to split purchases interest-free at over 65,000 partner merchants.',
  founded_year = 2019,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '500-1000',
  funding_stage = 'Series D+',
  total_raised = '$700M+',
  latest_funding_date = '2024',
  key_investors = 'Wellington Management, STV, Mubadala',
  website_url = 'https://tabby.ai',
  last_enriched_at = now()
WHERE LOWER(name) = 'tabby';

UPDATE companies SET
  description = 'Buy now, pay later and financial services platform serving consumers in Saudi Arabia, UAE, and Kuwait with Shariah-compliant solutions.',
  founded_year = 2020,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series C',
  total_raised = '$500M',
  latest_funding_date = 'Dec 2023',
  key_investors = 'SNB Capital, Sanabil Investments, Coatue',
  website_url = 'https://tamara.co',
  last_enriched_at = now()
WHERE LOWER(name) = 'tamara';

UPDATE companies SET
  description = 'Peer-to-peer payment and SME payments app enabling instant digital money transfers and business payment acceptance in the UAE.',
  founded_year = 2020,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Series A',
  total_raised = '$30M',
  latest_funding_date = 'Sep 2024',
  key_investors = 'Altos Ventures, Y Combinator, Avenir Growth',
  website_url = 'https://ziina.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'ziina';

UPDATE companies SET
  description = 'Digital payment gateway and financial services platform enabling businesses to accept payments across the MENA region.',
  founded_year = 2014,
  headquarters = 'Kuwait City, Kuwait',
  headcount_range = '200-500',
  funding_stage = 'Series B',
  total_raised = 'Undisclosed',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://tap.company',
  last_enriched_at = now()
WHERE LOWER(name) = 'tap payments';

UPDATE companies SET
  description = 'UAE digital bank and banking-as-a-service platform providing accounts, payments, and embedded banking for businesses and consumers.',
  founded_year = 2022,
  headquarters = 'Abu Dhabi, UAE',
  headcount_range = '200-500',
  funding_stage = 'Series A',
  total_raised = '$685M (AED 2.3B)',
  latest_funding_date = '2022',
  key_investors = 'ADQ, e& (Etisalat), First Abu Dhabi Bank',
  website_url = 'https://wio.io',
  last_enriched_at = now()
WHERE LOWER(name) = 'wio';

UPDATE companies SET
  description = 'UAE corporate card and spend management platform helping SMEs manage business expenses and automate finance operations.',
  founded_year = 2021,
  headquarters = 'Dubai, UAE',
  headcount_range = '50-200',
  funding_stage = 'Seed',
  total_raised = '$10M',
  latest_funding_date = 'Jan 2025',
  key_investors = 'Global Founders Capital, Rhino Ventures, Soma Capital',
  website_url = 'https://getpluto.com',
  last_enriched_at = now()
WHERE LOWER(name) = 'pluto';

UPDATE companies SET
  description = 'Saudi-listed digital services company providing secure e-government and digital transformation solutions across KSA.',
  founded_year = 1988,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '1000-5000',
  funding_stage = 'Public',
  total_raised = 'N/A (public)',
  latest_funding_date = null,
  key_investors = null,
  website_url = 'https://www.elm.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'elm';

UPDATE companies SET
  description = 'Saudi digital wallet and payment service offering mobile payments, remittances, and financial services to consumers and merchants.',
  founded_year = 2018,
  headquarters = 'Riyadh, Saudi Arabia',
  headcount_range = '200-500',
  funding_stage = 'Series D+',
  total_raised = 'Undisclosed',
  latest_funding_date = null,
  key_investors = 'STC Group',
  website_url = 'https://stcpay.com.sa',
  last_enriched_at = now()
WHERE LOWER(name) = 'stc pay';

UPDATE companies SET
  description = 'Leading payment solutions provider enabling digital commerce for merchants and financial institutions across the Middle East and Africa.',
  founded_year = 1994,
  headquarters = 'Dubai, UAE',
  headcount_range = '1000-5000',
  funding_stage = 'Acquired',
  total_raised = 'N/A',
  latest_funding_date = null,
  key_investors = 'Brookfield Asset Management',
  website_url = 'https://www.network.ae',
  last_enriched_at = now()
WHERE LOWER(name) = 'network international';
