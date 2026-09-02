// Structural validation for 037_admin_ai.sql.
// Ensures each ai_* function body is complete before the next one starts,
// and that each has exactly one revoke + one grant adjacent.
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/037_admin_ai.sql', 'utf8');
const names = ['ai_overview','ai_requests','ai_workers','ai_commissions','ai_complaints','ai_customers','ai_reviews','ai_cancellations','ai_coupons_referrals','ai_notes','ai_timeseries','ai_compare'];

let failed = false;
let prevEnd = 0;
for (const name of names) {
  const start = sql.indexOf(`create or replace function public.${name}(`);
  if (start === -1) { console.error('MISSING CREATE:', name); failed = true; continue; }
  if (start < prevEnd) { console.error('NESTED/OUT-OF-ORDER:', name, 'start', start, '< prevEnd', prevEnd); failed = true; }
  // Body ends at the first 'end;\n$$;' after start.
  const endMarker = 'end;\n$$;';
  const bodyEnd = sql.indexOf(endMarker, start);
  if (bodyEnd === -1) { console.error('NO BODY END for', name); failed = true; continue; }

  // Between start and bodyEnd there must NOT be another function create.
  const innerCreate = sql.slice(start + 30, bodyEnd).search(/create or replace function public\./);
  if (innerCreate !== -1) { console.error('NESTED FUNCTION inside', name); failed = true; }

  const closePos = bodyEnd + endMarker.length;
  const after = sql.slice(closePos, closePos + 600);
  const revoke = after.includes(`revoke all on function public.${name}(`);
  const grant = after.includes(`grant execute on function public.${name}(`);
  if (!revoke || !grant) { console.error('REVOKE/GRANT missing for', name, 'revoke=', revoke, 'grant=', grant); failed = true; }

  const seg = sql.slice(start, bodyEnd);
  const secDef = seg.includes('security definer');
  const adminGuard = /if not public\.is_admin\(\) then[\s\S]{0,120}raise exception 'Access denied'/.test(seg);
  if (!secDef) { console.error('NO security definer for', name); failed = true; }
  if (!adminGuard) { console.error('NO is_admin guard for', name); failed = true; }

  prevEnd = bodyEnd;
}

// Count revoke/grant occurrences globally.
for (const name of names) {
  const revokes = (sql.match(new RegExp(`revoke all on function public\\.${name}\\(`, 'g')) || []).length;
  const grants = (sql.match(new RegExp(`grant execute on function public\\.${name}\\(`, 'g')) || []).length;
  if (revokes !== 1 || grants !== 1) { console.error('REVOKE/GRANT COUNT', name, 'revokes=', revokes, 'grants=', grants); failed = true; }
}

if (failed) {
  console.error('\nVALIDATION FAILED');
  process.exit(1);
}
console.log('ALL', names.length, 'AI FUNCTIONS VALID (complete bodies, single revoke+grant, security definer + is_admin guard).');