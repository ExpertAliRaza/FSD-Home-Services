import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = await readFile(new URL('../supabase/migrations/001_phase1_schema.sql', import.meta.url), 'utf8');
const rls = await readFile(new URL('../supabase/migrations/002_phase1_rls.sql', import.meta.url), 'utf8');
const notificationsReviews = await readFile(new URL('../supabase/migrations/004_notifications_reviews.sql', import.meta.url), 'utf8');
const launchV1 = await readFile(new URL('../supabase/migrations/005_launch_v1.sql', import.meta.url), 'utf8');
const releaseV11 = await readFile(new URL('../supabase/migrations/006_release_v1_1_worker_dashboard.sql', import.meta.url), 'utf8');
const releaseV11Security = await readFile(new URL('../supabase/migrations/007_release_v1_1_worker_security.sql', import.meta.url), 'utf8');
const releaseV11RpcFix = await readFile(new URL('../supabase/migrations/008_release_v1_1_rpc_fix.sql', import.meta.url), 'utf8');
const workerSignupFix = await readFile(new URL('../supabase/migrations/009_fix_worker_signup.sql', import.meta.url), 'utf8');
const publicWorkerApplications = await readFile(new URL('../supabase/migrations/010_public_worker_applications.sql', import.meta.url), 'utf8');
const removeLegacyWorkerAuth = await readFile(new URL('../supabase/migrations/011_remove_legacy_worker_auth_onboarding.sql', import.meta.url), 'utf8');
const workerPhonePassword = await readFile(new URL('../supabase/migrations/012_worker_phone_password_access.sql', import.meta.url), 'utf8');
const workerRpcHardening = await readFile(new URL('../supabase/migrations/013_harden_worker_application_rpc.sql', import.meta.url), 'utf8');
const adminDeleteRecords = await readFile(new URL('../supabase/migrations/014_admin_delete_records.sql', import.meta.url), 'utf8');
const createWorkerAccount = await readFile(new URL('../supabase/functions/create-worker-account/index.ts', import.meta.url), 'utf8');
const seed = await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
const router = await readFile(new URL('../src/app/router.jsx', import.meta.url), 'utf8');
const api = await readFile(new URL('../src/lib/api.js', import.meta.url), 'utf8');
const workerSignupForm = await readFile(new URL('../src/components/forms/WorkerSignupForm.jsx', import.meta.url), 'utf8');
const workerDirectory = await readFile(new URL('../src/pages/public/WorkerDirectory.jsx', import.meta.url), 'utf8');
const layout = await readFile(new URL('../src/components/layout/Layout.jsx', import.meta.url), 'utf8');
const routeMeta = await readFile(new URL('../src/components/layout/RouteMeta.jsx', import.meta.url), 'utf8');

test('public worker view excludes private columns and filters approval', () => {
  const view = schema.slice(
    schema.indexOf('create or replace view public.public_worker_cards'),
    schema.indexOf('create or replace function public.handle_new_user')
  );
  assert.match(view, /where w\.status = 'approved'/);
  assert.doesNotMatch(view, /\bw\.phone\b|\bw\.cnic_number\b|admin_rejection_reason/);
});

test('raw workers are not publicly readable', () => {
  assert.match(rls, /workers own or admin read/);
  assert.doesNotMatch(rls, /status = 'approved' or profile_id = auth\.uid\(\)/);
});

test('anonymous requests use a constrained RPC instead of table inserts', () => {
  assert.match(schema, /create or replace function public\.submit_service_request/);
  assert.match(schema, /status = 'approved'\s+and service_category_id = p_service_category_id/);
  assert.doesNotMatch(rls, /create policy "anonymous can create requests"/);
});

test('self signup cannot request admin and workers cannot approve themselves', () => {
  assert.match(schema, /when new\.raw_user_meta_data->>'role' = 'worker' then 'worker'/);
  assert.match(schema, /Only an admin can update approval and trust fields/);
  assert.match(schema, /Only an admin can change account roles/);
});

test('each auth account can own only one worker application', () => {
  assert.match(schema, /workers_profile_id_unique_idx/);
});

test('lead assignments reject non-approved workers', () => {
  assert.match(schema, /Only approved workers can be assigned/);
});

test('worker media is private and approval-aware', () => {
  assert.match(rls, /\('worker-public', 'worker-public', false,/);
  assert.match(rls, /public\.is_approved_worker_asset\(name\)/);
  assert.doesNotMatch(rls, /create policy "public read approved worker photos"/);
});

test('notifications are admin-only and created for both submission types', () => {
  assert.match(notificationsReviews, /admins manage notifications/);
  assert.match(notificationsReviews, /new_service_request/);
  assert.match(notificationsReviews, /new_worker_application/);
});

test('review tokens are unique, expiring, and single-use', () => {
  assert.match(notificationsReviews, /token uuid not null unique default gen_random_uuid/);
  assert.match(notificationsReviews, /expires_at timestamptz not null/);
  assert.match(notificationsReviews, /This review link has already been used/);
  assert.match(notificationsReviews, /This review link has expired/);
});

test('review submission validates rating and updates worker aggregates', () => {
  assert.match(notificationsReviews, /rating integer not null check \(rating between 1 and 5\)/);
  assert.match(notificationsReviews, /rating_avg = stats\.rating_avg/);
  assert.match(notificationsReviews, /review_count = stats\.review_count/);
  assert.match(notificationsReviews, /w\.review_count/);
});

test('completion creates one review invitation and requires an assignment', () => {
  assert.match(notificationsReviews, /service_request_id uuid not null unique/);
  assert.match(notificationsReviews, /Assign an approved worker before completing this request/);
  assert.match(notificationsReviews, /old\.status is distinct from 'completed'/);
});

test('launch v1 records a fixed ten percent commission atomically', () => {
  assert.match(launchV1, /create table if not exists public\.commission_transactions/);
  assert.match(launchV1, /commission_percentage numeric\(5,2\) not null default 10/);
  assert.match(launchV1, /commission_amount numeric\(12,2\) generated always/);
  assert.match(launchV1, /create or replace function public\.complete_service_request/);
  assert.match(launchV1, /Record the actual job value before completing this request/);
});

test('launch v1 enforces assignment category and one active worker', () => {
  assert.match(launchV1, /one_active_assignment_per_request_idx/);
  assert.match(launchV1, /matching service category/);
  assert.match(launchV1, /status = 'approved'/);
});

test('launch v1 requires single-use Turnstile proofs for both public submissions', () => {
  assert.match(launchV1, /consume_turnstile_verification/);
  assert.match(launchV1, /'service_request'/);
  assert.match(launchV1, /'worker_signup'/);
  assert.match(launchV1, /drop policy if exists "workers insert own pending"/);
});

test('complaints are admin-only and create notifications', () => {
  assert.match(launchV1, /create table if not exists public\.complaints/);
  assert.match(launchV1, /admins manage complaints/);
  assert.match(launchV1, /complaint_submitted/);
});

test('launch seed contains no fake public workers or trust metrics', () => {
  assert.doesNotMatch(seed, /insert into public\.workers/);
  assert.match(launchV1, /delete from public\.workers\s+where profile_id is null/);
  assert.match(launchV1, /trust_badges = '\{\}'::text\[\]/);
  const launchView = launchV1.slice(launchV1.lastIndexOf('create view public.public_worker_cards'));
  assert.doesNotMatch(launchView, /rating_avg|completed_jobs_count|repeat_customers_count|reliability_score|trust_badges/);
});

test('release v1.1 notifications are recipient-scoped and realtime enabled', () => {
  assert.match(releaseV11, /recipient_id uuid references public\.profiles/);
  assert.match(releaseV11, /recipient_role in \('admin', 'worker'\)/);
  assert.match(releaseV11, /recipients read notifications/);
  assert.match(releaseV11, /recipient_id = auth\.uid\(\)/);
  assert.match(releaseV11, /alter publication supabase_realtime add table public\.notifications/);
  assert.match(releaseV11, /Only the notification read state can be changed/);
});

test('release v1.1 workers can only respond to their own assigned leads', () => {
  const responseFunction = releaseV11.slice(
    releaseV11.indexOf('create or replace function public.respond_to_lead'),
    releaseV11.indexOf('create or replace function public.update_worker_profile')
  );
  assert.match(responseFunction, /w\.profile_id = auth\.uid\(\)/);
  assert.match(responseFunction, /assignment\.status <> 'assigned'/);
  assert.match(responseFunction, /p_response not in \('accepted', 'rejected'\)/);
});

test('release v1.1 creates required admin and worker notification events', () => {
  for (const type of [
    'new_worker_signup', 'new_customer_request', 'worker_accepted_lead',
    'worker_rejected_lead', 'job_completed', 'new_complaint', 'new_review',
    'commission_recorded', 'profile_approved', 'profile_rejected',
    'new_lead_assigned', 'lead_cancelled', 'commission_due'
  ]) {
    assert.match(releaseV11, new RegExp(`'${type}'`));
  }
});

test('release v1.1 includes every protected worker dashboard page', () => {
  for (const path of [
    'leads', 'jobs', 'earnings', 'reviews', 'notifications',
    'profile', 'documents', 'settings'
  ]) {
    assert.match(router, new RegExp(`path: '${path}'`));
  }
  assert.match(router, /path: '\/worker'/);
  assert.match(router, /path: '\/worker\/login'/);
});

test('release v1.1 client subscribes to recipient-filtered realtime notifications', () => {
  assert.match(api, /postgres_changes/);
  assert.match(api, /filter: `recipient_id=eq\.\$\{recipientId\}`/);
  assert.match(api, /respond_to_lead/);
  assert.match(api, /update_worker_profile/);
  assert.match(api, /replace_worker_documents/);
});

test('release v1.1 worker RPCs require an authenticated worker account', () => {
  assert.match(releaseV11Security, /create or replace function public\.require_worker_account/);
  assert.match(releaseV11Security, /Worker authentication is required/);
  for (const routine of [
    'respond_to_lead',
    'update_worker_profile',
    'replace_worker_documents',
    'add_worker_work_photos',
    'remove_worker_work_photo',
    'update_notification_preferences'
  ]) {
    const start = releaseV11Security.indexOf(`create or replace function public.${routine}`);
    assert.notEqual(start, -1);
    assert.match(releaseV11Security.slice(start, start + 1800), /require_worker_account/);
  }
});

test('release v1.1 assigned workers can read request photos', () => {
  assert.match(releaseV11Security, /workers read assigned request photos/);
  assert.match(releaseV11Security, /w\.profile_id = auth\.uid\(\)/);
});

test('release v1.1 worker RPC fix avoids ambiguous worker identifiers', () => {
  assert.match(releaseV11RpcFix, /v_worker_id uuid/);
  assert.match(releaseV11RpcFix, /la\.worker_id = v_worker_id/);
  assert.match(releaseV11RpcFix, /wp\.worker_id = v_worker_id/);
});

test('public workers route keeps the public layout and remains indexable', () => {
  assert.match(layout, /pathname === '\/worker'/);
  assert.match(layout, /pathname\.startsWith\('\/worker\/'\)/);
  assert.doesNotMatch(layout, /pathname\.startsWith\('\/worker'\) &&/);
  assert.match(routeMeta, /pathname === '\/worker'/);
  assert.match(routeMeta, /pathname\.startsWith\('\/worker\/'\)/);
});

test('worker login remains in the public layout while dashboard routes use the private shell', () => {
  assert.match(layout, /pathname !== '\/worker\/login'/);
  assert.doesNotMatch(layout, /\['\/worker\/login', 'Worker Login'\]/);
  assert.match(workerDirectory, /to="\/worker\/login"/);
  assert.match(workerDirectory, /Worker Login/);
});

test('public footer is trust-focused, responsive, and contains official social links', () => {
  assert.doesNotMatch(layout, /Workers pay a 10% platform commission/);
  assert.match(layout, /Verified Workers/);
  assert.match(layout, /Manual Approval/);
  assert.match(layout, /Local Support/);
  assert.match(layout, /facebook\.com\/FSD\.Home\.Services/);
  assert.match(layout, /instagram\.com\/fsd_home_services/);
  assert.match(layout, /linkedin\.com\/company\/134874243/);
  assert.match(layout, /xl:grid-cols-\[1\.55fr_repeat\(4,minmax\(0,1fr\)\)\]/);
  assert.match(layout, /Privacy Policy/);
  assert.match(layout, /Terms of Service/);
});

test('worker signup prepares the authenticated profile and keeps applications pending', () => {
  assert.match(workerSignupFix, /prepare_worker_application_account/);
  assert.match(workerSignupFix, /values \(auth\.uid\(\), 'worker'/);
  assert.match(workerSignupFix, /profile_id, display_name/);
  assert.match(workerSignupFix, /auth\.uid\(\), trim\(p_display_name\)/);
  assert.match(workerSignupFix, /p_expected_visit_charges, 'pending'/);
  assert.match(workerSignupFix, /A worker application already exists for this account/);
});

test('worker applications use phone and password without email confirmation', () => {
  assert.doesNotMatch(api, /auth\.signUp|getWorkerSignupSession|requiresEmailConfirmation/);
  assert.doesNotMatch(workerSignupForm, /Confirm Your Email/);
  assert.match(workerSignupForm, /name="password"/);
  assert.match(workerSignupForm, /Email \(optional\)/);
  assert.match(workerSignupForm, /navigate\('\/worker', \{ replace: true \}\)/);
  assert.doesNotMatch(workerSignupForm, /Application Submitted|Open Worker Dashboard/);
  assert.match(api, /create-worker-account/);
  assert.match(api, /signInWithPassword/);
  assert.match(api, /p_email: payload\.email/);
  assert.match(api, /uploadedObjects/);
  assert.match(api, /storage\.from\(bucket\)\.remove\(paths\)/);
  assert.match(removeLegacyWorkerAuth, /drop function if exists public\.prepare_worker_application_account/);
});

test('phone-password access creates a confirmed worker Auth account', () => {
  assert.match(createWorkerAccount, /consume_turnstile_verification/);
  assert.match(createWorkerAccount, /email_confirm: true/);
  assert.match(createWorkerAccount, /role: 'worker'/);
  assert.match(createWorkerAccount, /auth\.fsdhomeservices\.pk/);
  assert.match(createWorkerAccount, /cnic_number/);
  assert.match(createWorkerAccount, /active worker application already exists/i);
  assert.match(workerPhonePassword, /profile_id, display_name, phone, email/);
  assert.match(workerPhonePassword, /auth\.uid\(\), trim\(p_display_name\)/);
  assert.match(workerPhonePassword, /p_expected_visit_charges, 'pending'/);
  assert.match(workerPhonePassword, /to authenticated/);
  assert.match(workerRpcHardening, /from anon/);
});

test('admin delete RPCs require admin access and clean dependent private records', () => {
  assert.match(adminDeleteRecords, /admin_delete_worker/);
  assert.match(adminDeleteRecords, /admin_delete_service_request/);
  assert.match(adminDeleteRecords, /if not public\.is_admin\(\)/);
  assert.match(adminDeleteRecords, /delete from public\.commission_transactions/);
  assert.match(adminDeleteRecords, /delete from public\.complaints/);
  assert.match(adminDeleteRecords, /delete from auth\.users/);
  assert.match(adminDeleteRecords, /admins delete managed storage objects/);
});

test('public worker application RPC is Turnstile protected and creates pending private workers', () => {
  assert.match(publicWorkerApplications, /profile_id, display_name, phone, email/);
  assert.match(publicWorkerApplications, /null, trim\(p_display_name\)/);
  assert.match(publicWorkerApplications, /p_expected_visit_charges, 'pending'/);
  assert.match(publicWorkerApplications, /consume_turnstile_verification/);
  assert.match(publicWorkerApplications, /to anon, authenticated/);
  assert.match(publicWorkerApplications, /New Worker Application/);
});

test('public worker applications block active duplicate phone and CNIC records', () => {
  assert.match(publicWorkerApplications, /workers_active_phone_unique_idx/);
  assert.match(publicWorkerApplications, /workers_active_cnic_unique_idx/);
  assert.match(publicWorkerApplications, /already exists with this phone number/);
  assert.match(publicWorkerApplications, /already exists with this CNIC/);
});
