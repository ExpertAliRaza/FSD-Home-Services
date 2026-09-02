# FSD Home Services

Release v1.1 for a Faisalabad-based verified home services marketplace.

## Features

- Public website with home, services, service SEO pages, worker directory, request service, become a worker, contact, and login pages.
- Anonymous customer service request form.
- Worker signup with Supabase Auth. Name, phone, service, and area are required; password, CNIC, profile photo, and experience are optional.
- Admin dashboard for worker approval, profile editing, request assignment, complaints, completion values, 10% commission tracking, notifications, internal notes, business intelligence, exports, and standard backups.
- Worker dashboard with leads, jobs, earnings, reviews, realtime notifications, profile, documents, and settings.
- Public worker directory shows approved workers only.
- Worker phone numbers, customer phone numbers, CNIC data, and admin notes are not shown publicly.
- Supabase SQL schema, seed data, RLS policies, and storage bucket policies.
- PWA manifest and service worker.
- SEO metadata, sitemap, robots.txt, legal pages, and structured data for local services.
- Vercel-ready Vite deployment.

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- Supabase Auth
- Supabase Database
- Supabase Storage
- PWA support
- jsPDF and JSZip for admin reports/backups

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

Apply every SQL file in `supabase/migrations/` in numeric order, currently `001_phase1_schema.sql` through `026_clear_fallback_worker_cnics.sql`.

Then run:

```sql
-- supabase/seed.sql
```

The seed file creates Faisalabad areas and service categories. Launch v1.0 contains no seeded public workers or fake trust metrics.

## Launch v1.0 Secrets

Frontend:

```bash
VITE_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
```

Supabase Edge Function secrets:

```bash
supabase secrets set TURNSTILE_SECRET_KEY=your-cloudflare-turnstile-secret
supabase secrets set RESEND_API_KEY=your-resend-api-key
supabase secrets set ADMIN_NOTIFICATION_EMAIL=your-admin-email
supabase secrets set NOTIFICATION_FROM_EMAIL="FSD Home Services <notifications@your-domain>"
```

Deploy:

```bash
supabase functions deploy verify-turnstile --no-verify-jwt
supabase functions deploy notify-admin --no-verify-jwt
supabase functions deploy create-worker-account --no-verify-jwt
```

Worker signup uses a phone-based private Auth email internally. Keep Edge Function secrets configured and keep Turnstile enabled for public submissions.

## Google Reviews (Homepage)

The homepage "What Our Customers Say" section currently renders a premium review
carousel from the static `googleReviews` array in `src/data/googleReviews.js`.
The working reviews stay isolated in that one file so they can be swapped for
live Google review data later (via the `fetch-google-reviews` Supabase Edge
Function, which proxies the Google Places API (New)) without touching the
carousel UI.

Required Google Cloud setup (external to this repository):

1. Create or reuse a **Google Cloud project**, enable the **Places API (New)**,
   and attach a billing account.
2. Create a **Places API key** and restrict it to the Places API.
3. Find the **Place ID** of the FSD Home Services Google Business Profile using
   Google's Place ID finder at
   <https://developers.google.com/maps/documentation/places/web-service/place-id>.

Configure the Supabase Edge Function secrets:

```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your-google-places-api-key
supabase secrets set GOOGLE_PLACE_ID=your-google-place-id
```

Deploy the function:

```bash
supabase functions deploy fetch-google-reviews --no-verify-jwt
```

Notes:

- Google Places API returns up to 5 text reviews; the carousel shows 3 cards on
  desktop, 2 on tablet and 1 on mobile, with arrows, pagination dots, autoplay,
  swipe and keyboard navigation.
- Until live data replaces the static array, the carousel uses the supplied
  working reviews; the compact 4.8 rating summary and "Read reviews on Google"
  link always use the owner-verified Google figures.
- The Google API key is server-side only (`GOOGLE_PLACES_API_KEY` secret); it
  is never exposed in the browser bundle.

## Admin AI Assistant

The `/admin` dashboard includes an AI assistant backed by the `chat` Supabase Edge
Function, which calls Groq and answers data questions through guarded read-only
RPCs (`ai_*` functions in `supabase/migrations/037_admin_ai.sql`).

Configure its secrets, then deploy:

```bash
supabase secrets set GROQ_API_KEY=your-groq-api-key
# Optional: override the model id. Defaults to openai/gpt-oss-120b in code.
# NOTE: llama-3.3-70b-versatile is no longer accessible to developer-plan keys
# (Enterprise-only tier), so it must NOT be used unless your key has access.
# supabase secrets set GROQ_MODEL=openai/gpt-oss-20b
supabase functions deploy chat
```

QA harness (requires a signed-in admin JWT in `ADMIN_TOKEN`):

```bash
node scripts/test-ai-questions.js
```

## Admin User

Create a user in Supabase Auth, then mark that profile as admin:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';
```

Sign in at `/login`, then open `/admin`.

Workers sign in at `/worker/login`. Approved and pending workers can access `/worker` to view their status, while assigned leads are protected by RLS and can only be accepted or rejected by the assigned worker.

## Important Security Notes

- Public worker cards should use `public.public_worker_cards`.
- Raw worker rows are limited to the owning worker and admins; public users can only query the restricted public view.
- CNIC images use the private `worker-private` bucket.
- Profile and work images use an approval-aware private bucket and signed URLs.
- Customer request photos use the private `request-photos` bucket.
- Worker phone, customer phone, CNIC, and admin notes are dashboard-only.
- Investor reports and standard backups exclude CNIC images, signed URLs, passwords, private worker documents, and private notes by default.
- Standard backup ZIPs are generated client-side for admin convenience. Production cloud backups/restores should be implemented with server-side encryption, offsite storage, retention, and restore dry-runs.

## Folder Structure

```txt
src/
  app/
  components/
    cards/
    dashboard/
    forms/
    legal/
    layout/
    notifications/
    pwa/
    support/
    worker/
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

## Release v1.1 Limitations

- No payments.
- No automatic matching.
- No server-side cloud backup/restore automation yet.
- No complex reliability score logic.
- Commission collection remains manual.
- No SMS notifications.
"# FSD-Home-Services" 
