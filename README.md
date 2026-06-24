# FSD Home Services

Phase 1 MVP for a Faisalabad-based verified home services marketplace.

## Features

- Public website with home, services, service SEO pages, worker directory, request service, become a worker, contact, and login pages.
- Anonymous customer service request form.
- Worker signup with Supabase Auth, CNIC uploads, profile photo, areas, availability, expected visit charges, and work photos.
- Admin dashboard for worker approval/rejection/status changes, service request status changes, manual worker assignment, and internal notes.
- Public worker directory shows approved workers only.
- Worker phone numbers, customer phone numbers, CNIC data, and admin notes are not shown publicly.
- Supabase SQL schema, seed data, RLS policies, and storage bucket policies.
- PWA manifest and service worker.
- Vercel-ready Vite deployment.

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- Supabase Auth
- Supabase Database
- Supabase Storage
- PWA support

## Setup

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Supabase Setup

Apply migrations in order:

1. `supabase/migrations/001_phase1_schema.sql`
2. `supabase/migrations/002_phase1_rls.sql`
3. `supabase/migrations/003_phase1_security_fixes.sql`

Then run:

```sql
-- supabase/seed.sql
```

The seed file creates Faisalabad areas, service categories, and six dummy approved workers.

Worker signup supports either Supabase email mode. If **Confirm email** is enabled, the worker confirms the account and submits the still-filled form again with the same credentials; the app signs in and completes the private uploads. Disabling confirmation keeps the flow to one step.

## Admin User

Create a user in Supabase Auth, then mark that profile as admin:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';
```

Sign in at `/login`, then open `/admin`.

## Important Security Notes

- Public worker cards should use `public.public_worker_cards`.
- Raw worker rows are limited to the owning worker and admins; public users can only query the restricted public view.
- CNIC images use the private `worker-private` bucket.
- Profile and work images use an approval-aware private bucket and signed URLs.
- Customer request photos use the private `request-photos` bucket.
- Worker phone, customer phone, CNIC, and admin notes are dashboard-only.

## Folder Structure

```txt
src/
  app/
  components/
    cards/
    dashboard/
    forms/
    layout/
  data/
  lib/
  pages/
    admin/
    auth/
    public/
public/
supabase/
  migrations/
  seed.sql
```

## Phase 1 Limitations

- No payments.
- No review system.
- No automatic matching.
- No worker dashboard beyond signup/auth foundation.
- No complex reliability score logic.
- Manual admin assignment only.
"# FSD-Home-Services" 
