-- v8.4 Focused company categories + cleanup.
-- Keeps only the category labels requested by Lean Talent and removes companies that cannot be classified into them.
-- Safe rollback point: this creates a full backup table before changing/deleting company records.

create table if not exists public.companies_backup_v84_before_category_remodel as
select * from public.companies;

-- Ensure source/category metadata columns exist from the fintech-universe release.
alter table public.companies add column if not exists source_url text;
alter table public.companies add column if not exists data_sources text[];
alter table public.companies add column if not exists source_profile_url text;
alter table public.companies add column if not exists awesomefintech_categories text;
alter table public.companies add column if not exists awesomefintech_rank text;

create temporary table v84_company_category_map as
select
  id,
  case
    when lower(coalesce(country,'') || ' ' || coalesce(region,'') || ' ' || coalesce(hq,'') || ' ' || coalesce(name,'')) ~ '(ksa|saudi|riyadh|jeddah|dammam)' then 'KSA'
    when lower(coalesce(country,'') || ' ' || coalesce(region,'') || ' ' || coalesce(hq,'') || ' ' || coalesce(name,'')) ~ '(uae|united arab emirates|dubai|abu dhabi|sharjah)' then 'UAE'
    when lower(name) in ('google','alphabet','meta','facebook','amazon','apple','microsoft','bytedance','tiktok','uber','careem','noon') then 'Big Tech'
    when lower(coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(open[ -]?banking|openbanking|account aggregation|bank api|banking api|financial data|data connectivity)' then 'OpenBanking'
    when lower(coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(payment infrastructure|payments infrastructure|processor|processing|acquir|issuer|issuing|card issuing|merchant acquiring|payment gateway|gateway|orchestration|checkout|api infrastructure)' then 'Payments Infrastructure'
    when lower(coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(remittance|money transfer|cross[ -]?border|fx|foreign exchange|transfer|send money)' then 'Remittance'
    when lower(coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(lending|loan|credit|bnpl|buy now pay later|mortgage|debt|financing|borrow)' then 'Lending'
    when lower(coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(trading|crypto|cryptocurrency|blockchain|invest|investing|investment|wealth|broker|brokerage|stock|stocks|asset management|digital asset|exchange|wallet)' then 'Trading, Crypto & Investing'
    when lower(coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(payment|payments|paytech|pay\b|cards?|pos|point of sale|merchant|wallet)' then 'Payments'
    when lower(coalesce(source,'') || ' ' || coalesce(sector,'') || ' ' || coalesce(sub_sector,'') || ' ' || coalesce(awesomefintech_categories,'') || ' ' || coalesce(rationale,'') || ' ' || coalesce(name,'')) ~ '(global fintech|fintech|banking|neobank|regtech|insurtech|identity|financial services|finance|saas)' then 'Global Fintech'
    else null
  end as focused_category
from public.companies;

-- Remove companies outside the requested category universe.
delete from public.companies c
using v84_company_category_map m
where c.id = m.id
  and m.focused_category is null;

-- Normalize every remaining company into one of the requested filters.
update public.companies c
set
  sector = 'FinTech',
  sub_sector = m.focused_category,
  updated_at = now()
from v84_company_category_map m
where c.id = m.id
  and m.focused_category is not null;

-- Optional source marker for auditability.
update public.companies
set source = coalesce(source, 'Focused fintech universe')
where source is null;

-- Clean up any saved filter names is handled client-side by the app.
