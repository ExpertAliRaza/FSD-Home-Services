// Manual QA harness for the upgraded admin AI assistant.
// Run with: node scripts/test-ai-questions.js
//
// Uses the live Supabase session of a signed-in admin from the Vite dev server.
// 1) Run `npm run dev`, sign in as admin in the browser.
// 2) Copy the admin session JWT (localStorage: sb-<project>-auth-token) into ADMIN_TOKEN.
// 3) Run this script. It prints each question, the tool calls made (sources),
//    and the final AI answer so you can verify the numbers match the Admin Panel.
//
// Requires env vars (from .env): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_TOKEN.
// The Gemini API key is configured as an Edge Function secret in the Supabase dashboard,
// not needed by this client-side script.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Minimal .env loader (the project has no dotenv dependency).
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > 0) env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // .env not present; rely on process env only.
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const adminToken = env.ADMIN_TOKEN;

if (!supabaseUrl || !supabaseAnonKey || !adminToken) {
  console.error(
    'Missing config. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and ADMIN_TOKEN.\n' +
      'Example:\n' +
      '  $env:VITE_SUPABASE_URL="https://x.supabase.co"\n' +
      '  $env:VITE_SUPABASE_ANON_KEY="eyJ..."\n' +
      '  $env:ADMIN_TOKEN="eyJ..."\n'
  );
  process.exit(1);
}

const QUESTIONS = [
  'Total requests last 7 days aur completion rate kya hai?',
  'Kitne approved workers hain?',
  'Revenue last 7 days? (platform commission)',
  'Cancelled orders in June ke reasons kya hain?',
  'Top 5 services this month?',
  'Open complaints is week kitne hain?',
  'Compare this month vs last month.',
  'Which worker completed the most jobs?',
  '12553 total customers kya hain?',
  'What was the revenue in March 2025?'
];

async function main() {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${adminToken}` } }
  });

  const { data: profileData, error: profileError } = await client
    .from('profiles')
    .select('role')
    .limit(1);
  if (profileError) {
    console.error('Could not talk to Supabase. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.', profileError.message);
    process.exit(1);
  }
  console.log('Supabase reachable. Running AI question battery...\n');

  for (const question of QUESTIONS) {
    process.stdout.write(`\n=== Q: ${question}\n`);
    try {
      const { data, error } = await client.functions.invoke('chat', {
        body: { message: question, history: [] }
      });
      if (error) {
        console.log('EDGE ERROR:', error.message);
        continue;
      }
      const reply = data?.reply || '(no reply)';
      const sources = Array.isArray(data?.sources) ? data.sources : [];
      console.log('SOURCES:', sources.length ? sources.join(', ') : '(none - likely no tool call)');
      console.log('ANSWER:\n' + reply);
    } catch (err) {
      console.log('NETWORK/OTHER ERROR:', err.message);
    }
  }

  console.log('\nDone. Cross-check the numbers above against the Admin Panel:');
  console.log(' - Analytics tab (same ranges)');
  console.log(' - Business Intelligence tab (same ranges)');
  console.log(' - Workers / Requests / Commissions / Complaints filtered lists\n');
}

// Only run when executed directly (e.g. `node scripts/test-ai-questions.js`).
// Prevents the QA harness from auto-executing under `node --test`.
const isEntrypoint =
  process.argv[1] && resolve(process.cwd(), process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  main();
}