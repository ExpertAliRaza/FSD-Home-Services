import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = await readFile(new URL('../supabase/migrations/001_phase1_schema.sql', import.meta.url), 'utf8');
const rls = await readFile(new URL('../supabase/migrations/002_phase1_rls.sql', import.meta.url), 'utf8');

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
