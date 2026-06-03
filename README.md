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
