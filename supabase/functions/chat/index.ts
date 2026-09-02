import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildSystemPrompt, buildTools } from './system_prompt.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Model selection: llama-3.3-70b-versatile was moved to Groq's Enterprise-only
// tier, so a normal developer key gets "model_not_found / no access" for it.
// Default to a production model that every developer key can call and that
// supports function/tool calling. Override with the GROQ_MODEL secret if needed
// (e.g. set GROQ_MODEL=openai/gpt-oss-20b for lower cost).
const GROQ_MODEL = Deno.env.get('GROQ_MODEL') || 'openai/gpt-oss-120b';
const MAX_TOOL_ROUNDS = 3;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface ChatMessage {
  role: string;
  content: string | null;
  name?: string;
  tool_calls?: Array<Record<string, unknown>>;
  tool_call_id?: string;
}

interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

// Strict YYYY-MM-DD validation. Rejects malformed, future, and pre-2000 dates so
// no invalid values ever reach Postgres and no AI-written SQL/operators can be injected.
function validateDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const past = new Date('2000-01-01T00:00:00Z');
  if (d < past || d > today) return null;
  return value;
}

function clampLimit(value: unknown, def: number, max: number): number {
  const n = Number(value);
  if (Number.isNaN(n)) return def;
  return Math.min(Math.max(Math.floor(n), 1), max);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
// Builds only the fixed, typed RPC arguments for a tool name.
// This is a whitelist by construction: the model never supplies SQL or dynamic params.
function buildRpcArgs(toolName: string, args: Record<string, unknown>): { args: Record<string, unknown>; error?: string } {
  const out: Record<string, unknown> = {};
  switch (toolName) {
    case 'ai_overview': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (!s || !e) {
        return { args: out, error: 'start_date and end_date must both be valid YYYY-MM-DD dates between 2000-01-01 and today.' };
      }
      out.p_start_date = s;
      out.p_end_date = e;
      return { args: out };
    }
    case 'ai_requests': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      const status = cleanText(args.status);
      if (status) {
        if (!['new', 'reviewing', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
          return { args: out, error: 'status must be one of new, reviewing, assigned, in_progress, completed, cancelled.' };
        }
        out.p_status = status;
      }
      out.p_service = cleanText(args.service);
      out.p_area = cleanText(args.area);
      out.p_search = cleanText(args.search);
      out.p_limit = clampLimit(args.limit, 50, 200);
      return { args: out };
    }
    case 'ai_workers': {
      const status = cleanText(args.status);
      if (status) {
        if (!['pending', 'approved', 'rejected', 'needs_changes', 'suspended'].includes(status)) {
          return { args: out, error: 'status must be one of pending, approved, rejected, needs_changes, suspended.' };
        }
        out.p_status = status;
      }
      out.p_service = cleanText(args.service);
      out.p_area = cleanText(args.area);
      out.p_search = cleanText(args.search);
      out.p_limit = clampLimit(args.limit, 150, 500);
      return { args: out };
    }
    case 'ai_commissions': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      const ps = cleanText(args.payment_status);
      if (ps) {
        if (!['due', 'paid', 'waived'].includes(ps)) {
          return { args: out, error: 'payment_status must be one of due, paid, waived.' };
        }
        out.p_payment_status = ps;
      }
      out.p_worker = cleanText(args.worker);
      out.p_limit = clampLimit(args.limit, 200, 500);
      return { args: out };
    }
    case 'ai_complaints': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      const status = cleanText(args.status);
      if (status) {
        if (!['open', 'investigating', 'resolved', 'dismissed'].includes(status)) {
          return { args: out, error: 'status must be one of open, investigating, resolved, dismissed.' };
        }
        out.p_status = status;
      }
      out.p_limit = clampLimit(args.limit, 100, 300);
      return { args: out };
    }
    case 'ai_customers': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      out.p_search = cleanText(args.search);
      out.p_limit = clampLimit(args.limit, 200, 500);
      return { args: out };
    }
case 'ai_reviews': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      out.p_worker = cleanText(args.worker);
      out.p_limit = clampLimit(args.limit, 100, 300);
      return { args: out };
    }
    case 'ai_cancellations': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      out.p_limit = clampLimit(args.limit, 100, 300);
      return { args: out };
    }
    case 'ai_notes': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      const et = cleanText(args.entity_type);
      if (et) {
        if (!['worker', 'request', 'lead'].includes(et)) {
          return { args: out, error: 'entity_type must be one of worker, request, lead.' };
        }
        out.p_entity_type = et;
      }
      out.p_limit = clampLimit(args.limit, 100, 300);
      return { args: out };
    }
    case 'ai_coupons_referrals': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      if (args.start_date !== undefined && args.start_date !== null && !s) {
        return { args: out, error: 'start_date must be a valid YYYY-MM-DD date.' };
      }
      if (args.end_date !== undefined && args.end_date !== null && !e) {
        return { args: out, error: 'end_date must be a valid YYYY-MM-DD date.' };
      }
      if (s) out.p_start_date = s;
      if (e) out.p_end_date = e;
      return { args: out };
    }
    case 'ai_timeseries': {
      const s = validateDate(args.start_date);
      const e = validateDate(args.end_date);
      const granularity = cleanText(args.granularity);
      if (!s || !e) {
        return { args: out, error: 'start_date and end_date must both be valid YYYY-MM-DD dates between 2000-01-01 and today.' };
      }
      if (!granularity || !['day', 'week', 'month'].includes(granularity)) {
        return { args: out, error: 'granularity must be one of day, week, month.' };
      }
      out.p_start_date = s;
      out.p_end_date = e;
      out.p_granularity = granularity;
      return { args: out };
    }
    case 'ai_compare': {
      const s1 = validateDate(args.start_date_1);
      const e1 = validateDate(args.end_date_1);
      const s2 = validateDate(args.start_date_2);
      const e2 = validateDate(args.end_date_2);
      if (!s1 || !e1 || !s2 || !e2) {
        return { args: out, error: 'All four dates (start_date_1, end_date_1, start_date_2, end_date_2) must be valid YYYY-MM-DD dates between 2000-01-01 and today.' };
      }
      out.p_start_1 = s1;
      out.p_end_1 = e1;
      out.p_start_2 = s2;
      out.p_end_2 = e2;
      return { args: out };
    }
    default:
      return { args: out, error: `Unknown tool: ${toolName}` };
  }
}

// Executes a tool against Supabase using the service role. Only guarded, admin-checked RPCs.
async function callTool(
  adminSupabase: ReturnType<typeof createClient>,
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const { args: rpcArgs, error } = buildRpcArgs(toolName, args || {});
  if (error) return { ok: false, error };
  const { data, error: rpcError } = await adminSupabase.rpc(toolName, rpcArgs);
  if (rpcError) return { ok: false, error: `${toolName} failed: ${rpcError.message}` };
  return { ok: true, data };
}
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function safeToolName(name: unknown): string {
  const allowed = new Set([
    'ai_overview', 'ai_requests', 'ai_workers', 'ai_commissions', 'ai_complaints',
    'ai_customers', 'ai_reviews', 'ai_cancellations', 'ai_notes', 'ai_coupons_referrals',
    'ai_timeseries', 'ai_compare',
  ]);
  return typeof name === 'string' && allowed.has(name) ? name : '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const groqApiKey = Deno.env.get('GROQ_API_KEY') || '';

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is missing');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // 1) Verify the caller is a real authenticated user.
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: userError } = await userClient.auth.getUser();
    if (userError || !authData?.user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // 2) Double admin gate: profiles.role AND auth.users raw_user_meta_data.role.
    const profileClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: profileRows } = await profileClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .limit(1);
    const profileRole = profileRows?.[0]?.role;
    const metaRole = authData.user.raw_user_meta_data?.role;
    if (profileRole !== 'admin' && metaRole !== 'admin') {
      return json({ error: 'Forbidden' }, 403);
    }

    const { message, history = [] } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return json({ error: 'Message is required' }, 400);
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    const systemPrompt = buildSystemPrompt(todayIso);
    const tools = buildTools();

    // Filter history to valid roles only.
    const validHistory = (Array.isArray(history) ? history : []).filter(
      (m: ChatMessage) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()
    ).map((m: ChatMessage) => ({ role: m.role, content: m.content }));

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...validHistory.slice(-12),
      { role: 'user', content: message.trim() },
    ];

    const sources: string[] = [];
    let finalReply = 'Sorry, no response generated.';
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      rounds += 1;
      const groqResponse = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!groqResponse.ok) {
        const errTxt = await groqResponse.text();
        console.error('Groq Error:', errTxt);
        return json({ reply: `Groq API Error: ${errTxt}` });
      }

      const groqData = await groqResponse.json();
      const choice = groqData.choices?.[0]?.message;
      const toolCalls = choice?.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        finalReply = choice?.content || finalReply;
        break;
      }

      messages.push({
        role: 'assistant',
        content: choice?.content ?? null,
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        const toolName = safeToolName(toolCall?.function?.name);
        if (!toolName) continue;
        let parsedArgs: Record<string, unknown> = {};
        try {
          const raw = toolCall.function.arguments;
          if (typeof raw === 'string' && raw.trim()) {
            parsedArgs = JSON.parse(raw);
          }
        } catch {
          parsedArgs = {};
        }

        const toolResult = await callTool(adminSupabase, toolName, parsedArgs);
        const label = toolName.replace(/^ai_/, '');
        sources.push(toolResult.ok ? label : `${label} (error)`);

        messages.push({
          role: 'tool',
          tool_call_id: String(toolCall.id || ''),
          content: toolResult.ok ? JSON.stringify(toolResult.data) : JSON.stringify({ error: toolResult.error }),
          name: toolName,
        });
      }
    }

    return json({ reply: finalReply, sources });
  } catch (error) {
    console.error('Chat error:', error);
    return json({ reply: `Internal Error: ${(error as Error).message}` });
  }
});