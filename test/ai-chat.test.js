import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Load the new AI migration and the rewritten chat Edge Function.
const aiMigration = await readFile(new URL('../supabase/migrations/037_admin_ai.sql', import.meta.url), 'utf8');
const chatIndex = await readFile(new URL('../supabase/functions/chat/index.ts', import.meta.url), 'utf8');
const chatSystem = await readFile(new URL('../supabase/functions/chat/system_prompt.ts', import.meta.url), 'utf8');
const chatWidget = await readFile(new URL('../src/components/dashboard/ChatWidget.jsx', import.meta.url), 'utf8');
const api = await readFile(new URL('../src/lib/api.js', import.meta.url), 'utf8');
const adminPanel = await readFile(new URL('../src/components/dashboard/AdminPanel.jsx', import.meta.url), 'utf8');
const launchV1 = await readFile(new URL('../supabase/migrations/005_launch_v1.sql', import.meta.url), 'utf8');

const AI_FUNCTIONS = [
  'ai_overview',
  'ai_requests',
  'ai_workers',
  'ai_commissions',
  'ai_complaints',
  'ai_customers',
  'ai_reviews',
  'ai_cancellations',
  'ai_notes',
  'ai_coupons_referrals',
  'ai_timeseries',
  'ai_compare',
];

test('migration 037 adds cancellation tracking columns to service_requests', () => {
  assert.match(aiMigration, /add column if not exists cancelled_at timestamptz/);
  assert.match(aiMigration, /add column if not exists cancellation_reason text/);
});

test('every ai_* RPC exists in migration 037 and is admin-guarded', () => {
  for (const fn of AI_FUNCTIONS) {
    assert.match(aiMigration, new RegExp(`create or replace function public\\.${fn}\\(`));
    const snippet = aiMigration.slice(
      aiMigration.indexOf(`function public.${fn}(`),
      Math.min(aiMigration.indexOf(`function public.${fn}(`) + 4000, aiMigration.length)
    );
    assert.match(snippet, /security definer/);
    assert.match(snippet, /if not public\.is_admin\(\) then\s*\n\s*raise exception 'Access denied'/);
  }
});

test('no ai_* RPC function is nested inside another (regression: splice bug)', () => {
  // Each function body must END (end;\n$$;) before the next "create or replace" appears,
  // and each function must have exactly one revoke + one grant.
  // Order functions by their position in the file so monotonic checks are meaningful
  // (the migration may legitimately order different domains differently than this array).
  const byPosition = AI_FUNCTIONS.map((fn) => ({
    fn,
    start: aiMigration.indexOf(`create or replace function public.${fn}(`),
  })).sort((a, b) => a.start - b.start);

  let prevEnd = 0;
  for (const { fn, start } of byPosition) {
    assert.ok(start !== -1, `missing create for ${fn}`);
    assert.ok(start > prevEnd, `${fn} at ${start} is not after previous body end ${prevEnd}`);

    const bodyEnd = aiMigration.indexOf('end;\n$$;', start);
    assert.ok(bodyEnd !== -1, `${fn} body has no end;\\n$$;`);
    // Exclude the function's own signature (first ~30 chars) when checking for nested creates.
    const body = aiMigration.slice(start + 30, bodyEnd);
    assert.doesNotMatch(body, /create or replace function public\./, `${fn} contains a nested function definition`);

    const after = aiMigration.slice(bodyEnd, bodyEnd + 300);
    assert.match(after, new RegExp(`revoke all on function public\\.${fn}\\(`), `${fn} missing revoke after body`);
    assert.match(after, new RegExp(`grant execute on function public\\.${fn}\\(`), `${fn} missing grant after body`);
    prevEnd = bodyEnd;
  }
  for (const fn of AI_FUNCTIONS) {
    const revokes = (aiMigration.match(new RegExp(`revoke all on function public\\.${fn}\\(`, 'g')) || []).length;
    const grants = (aiMigration.match(new RegExp(`grant execute on function public\\.${fn}\\(`, 'g')) || []).length;
    assert.equal(revokes, 1, `${fn} revoke count ${revokes} != 1`);
    assert.equal(grants, 1, `${fn} grant count ${grants} != 1`);
  }
});

test('ai RPCs never build SQL from user input (no dynamic SQL)', () => {
  // PL/pgSQL dynamic SQL forms are forbidden. (plain "grant execute" is fine)
  assert.doesNotMatch(aiMigration, /\bexecute\s+immediate\b/i);
  assert.doesNotMatch(aiMigration, /\bexecute\s*'/i);
  assert.doesNotMatch(aiMigration, /format\(\s*'/);
});

test('ai RPCs use the exact Analytics date-border convention', () => {
  assert.match(
    aiMigration,
    />= p_start_date and .*< \(p_end_date \+ interval '1 day'\)/
  );
  assert.match(
    aiMigration,
    /created_at >= p_start_date and created_at < \(p_end_date \+ interval '1 day'\)/
  );
});

test('ai_overview honours both revenue definitions like the dashboard', () => {
  const overview = aiMigration.slice(
    aiMigration.indexOf('function public.ai_overview('),
    aiMigration.indexOf('revoke all on function public.ai_overview')
  );
  assert.match(overview, /'job_amount_total'/);
  assert.match(overview, /'commission_earned_total'/);
  assert.match(overview, /sum\(ct\.commission_amount\)/);
  assert.match(overview, /sum\(ct\.job_amount\)/);
});

test('ai_cancellations exposes both new cancellation_reason and legacy admin_notes fallback', () => {
  const canc = aiMigration.slice(
    aiMigration.indexOf('function public.ai_cancellations('),
    aiMigration.indexOf('revoke all on function public.ai_cancellations')
  );
  assert.match(canc, /cancellation_reason/);
  assert.match(canc, /admin_notes/);
  assert.match(canc, /coalesce\(sr\.cancelled_at, sr\.created_at\)/);
});
test('chat edge function uses tools-based RPC calls, never raw table dumps', () => {
  // The old implementation embedded full tables in the system prompt — must be gone.
  assert.doesNotMatch(chatIndex, /FULL DATABASE RAW DATA FOR CONTEXT AND ANALYSIS/);
  assert.doesNotMatch(chatIndex, /\.from\(['"]workers['"]\)/);
  assert.doesNotMatch(chatIndex, /JSON\.stringify\(workersData\)/);
  // Must route through guarded RPCs only.
  assert.match(chatIndex, /adminSupabase\.rpc\(toolName, rpcArgs\)/);
  // Whitelist builder must exist (no model-generated SQL path).
  assert.match(chatIndex, /buildRpcArgs/);
});

test('chat edge function validates dates and caps tool rounds', () => {
  assert.match(chatIndex, /DATE_RE/);
  assert.match(chatIndex, /validateDate/);
  assert.match(chatIndex, /MAX_TOOL_ROUNDS = 3/);
  assert.match(chatIndex, /tool_choice: 'auto'/);
});

test('chat edge function admin gate requires both role sources', () => {
  assert.match(chatIndex, /getUser\(\)/);
  assert.match(chatIndex, /raw_user_meta_data\?\.role/);
});

test('chat edge function exposes the full tool set of RPCs', () => {
  for (const fn of AI_FUNCTIONS) {
    assert.match(chatIndex, new RegExp(`['"]${fn}['"]`));
  }
});

test('system_prompt has no embedded raw data and instructs tool-only answers', () => {
  assert.doesNotMatch(chatSystem, /FULL DATABASE RAW DATA/);
  assert.doesNotMatch(chatSystem, /workersData|requestsData|commissionsData/);
  assert.match(chatSystem, /TODAY'S DATE/);
  assert.match(chatSystem, /NEVER confuse the two revenue figures/);
  assert.match(chatSystem, /commission earned/);
  assert.match(chatSystem, /job amount/);
});

test('ChatWidget surfaces sources from the new response shape', () => {
  assert.match(chatWidget, /data\?\.sources/);
  assert.match(chatWidget, /Array\.isArray\(data\?\.sources\)/);
  assert.match(chatWidget, /sources\.length > 0/);
});

test('updateRequestStatus persists cancellation reason and cancelled_at', () => {
  const fn = api.slice(
    api.indexOf('export async function updateRequestStatus'),
    api.indexOf('export async function updateServiceRequest')
  );
  assert.match(fn, /status === 'cancelled'/);
  assert.match(fn, /cancelled_at/);
  assert.match(fn, /cancellation_reason/);
});

test('AdminPanel requires a cancellation reason before cancelling a request', () => {
  assert.match(adminPanel, /window\.prompt\('Cancellation reason \(required\):'/);
  assert.match(adminPanel, /if \(!reason\.trim\(\)\)/);
  assert.match(adminPanel, /updateRequestStatus\(id, status, reason\.trim\(\)\)/);
  // Preserves the existing admin note functionality too.
  assert.match(adminPanel, /addAdminNote/);
});

test('commission schema confirms a fixed ten percent commission (foundation for revenue labels)', () => {
  assert.match(launchV1, /commission_percentage numeric\(5,2\) not null default 10/);
  assert.match(launchV1, /commission_amount numeric\(12,2\) generated always/);
});