import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = await readFile(new URL('../supabase/migrations/001_phase1_schema.sql', import.meta.url), 'utf8');
const rls = await readFile(new URL('../supabase/migrations/002_phase1_rls.sql', import.meta.url), 'utf8');
const notificationsReviews = await readFile(new URL('../supabase/migrations/004_notifications_reviews.sql', import.meta.url), 'utf8');
const launchV1 = await readFile(new URL('../supabase/migrations/005_launch_v1.sql', import.meta.url), 'utf8');
const seed = await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8');

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
