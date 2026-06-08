# Lean Talent Intelligence Platform

This is the production-ready starter for moving the prototype into a hosted internal app.

## Stack

- Next.js App Router
- Supabase Postgres
- Supabase Auth
- Row-level security restricted to Lean emails
- Candidate CSV import
- Lean 150 company universe seed script

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. In **Authentication > Providers**, enable Email and optionally Google.
5. For Google SSO, restrict access in the app using the `leantech.me` domain guard and RLS policies.
6. Copy Supabase URL and anon key into `.env.local`.
7. Add your service role key only locally for seeding.

## Seed the Lean 150 company universe

```bash
npm run seed
```

This imports `data/lean_150_company_universe.csv` into the `companies` table.

## Deploy to Vercel

1. Push this folder to a private GitHub repository.
2. Import the repo in Vercel.
3. Add these environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=leantech.me
```

Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to the browser-facing app unless you use it only in server-side scripts/functions.

## What is included

- Login and signup page
- Lean email-only validation
- Dashboard
- Companies page
- Candidate database
- Candidate CSV import
- Talent Pools page
- Supabase schema with RLS
- Seed script for companies

## Next production steps

- Add edit/delete screens for companies and candidates
- Add role-based permissions for Admin, Talent Partner, Sourcer, Hiring Manager
- Add Ashby integration through server-side API routes or Supabase Edge Functions
- Add audit/activity feed


## v3 speed + fit score update
- Company profile pages now render immediately using cached company data, then refresh from Supabase in the background.
- Company detail page supports editing Lean Fit Score, Website URL, and LinkedIn URL.

## v8 Candidate Intelligence Migration

After deploying this version, run this SQL file in Supabase SQL Editor:

```text
supabase/upgrade_v8_candidate_intelligence.sql
```

This adds CV upload metadata, candidate documents, career history, previous applications, candidate timeline, skills, relationship score, and Ashby-ready IDs. CV files are uploaded to a private Supabase Storage bucket named `candidate-cvs`.

Current parser note: PDF/DOCX files can be uploaded and stored. The in-app parser works on pasted CV text or `.txt` files. Full server-side PDF/DOCX parsing should be added later as a backend/Ashby integration service.

## v8.1 Candidate Intelligence Completion

This release completes the Candidate Intelligence layer before v9 Talent CRM.

New capabilities:
- Candidate profile completeness score
- Candidate tags
- Skills management
- Languages management
- Education section
- Career history edit/delete
- Application history edit/delete
- Improved CV text parser workspace
- Timeline events for profile, status, CV, skills, tags, education, experience, and applications

Supabase migration to run once:

```sql
supabase/upgrade_v81_candidate_intelligence_completion.sql
```


## v8.2 AwesomeFinTech company remodel

This release replaces the existing Companies dataset with an AwesomeFinTech-inspired fintech market map.

Run this in Supabase SQL Editor after pushing the app update:

```sql
-- see supabase/upgrade_v82_awesomefintech_company_remodel.sql
```

What it does:
- Adds AwesomeFinTech metadata columns to `companies`
- Clears existing company records and company notes
- Preserves candidates, but old company links are set to null
- Seeds a focused fintech-company universe from public AwesomeFinTech category/top pages

The public AwesomeFinTech pages expose category/top-list samples. The full 130K+ dataset requires AwesomeFinTech access.
