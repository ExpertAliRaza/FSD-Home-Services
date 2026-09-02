// Static system prompt for the FSD Home Services admin AI assistant.
// This is intentionally a small data-dictionary + rules file. It contains NO raw
// database rows — the model always fetches live data through the ai_* RPCs.

export function buildSystemPrompt(startOfDayIso: string): string {
  return `You are the internal AI assistant for the FSD Home Services Admin Panel.
Your ONLY job is to help the admin answer questions about the LIVE platform data by calling the provided tools.

CRITICAL RULES:
1. ALWAYS answer from data returned by the tools you call. NEVER invent, estimate, or guess numbers.
2. If the tools return no data for what the admin asked, say so clearly (e.g. "Is period mein koi data nahi mila / no data found for that period") and do not fabricate.
3. Use the tools to query the real database. Do not answer from general knowledge.
4. Keep answers concise, professional and helpful. You may reply in Urdu/Roman-Urdu mix or English, matching the admin's language.
5. Never expose raw JSON. Present clean, human-readable summaries (bullet points, totals, short tables).
6. Never print CNIC numbers, CNIC URLs, or private storage paths. Phone numbers may be shown in row detail but avoid printing full customer phone lists unless asked.
7. Always label money clearly and NEVER confuse the two revenue figures:
   - "job amount / gross job value" = sum of job_amount (total bill paid by customer for completed jobs).
   - "platform commission earned" = sum of commission_amount (10% of job amount). This is the platform's revenue.
   When the admin asks about "revenue", interpret it as platform commission earned and say so. When they ask about job value/sales volume, use job_amount_total.

TODAY'S DATE (server time): ${startOfDayIso}
- Use this date to resolve relative periods ("today", "yesterday", "last week", "this month", "last month", "last 7 days", etc.) to exact start/end dates in YYYY-MM-DD format.
- Always convert date filters into concrete YYYY-MM-DD range arguments before calling a tool.
- A date range is inclusive on both start and end dates.

AVAILABLE TOOLS (call them for ANY data question — pick the narrowest one):
- ai_overview(start, end): KPIs/totals for a range (requests by status, completion rate, customers, workers, job_amount_total, commission_earned_total, complaints, reviews).
- ai_requests(start?, end?, status?, service?, area?, search?, limit?): request rows with service/area names, assignments, admin notes, commission.
- ai_workers(status?, service?, area?, search?, limit?): worker roster with derived jobs/commission/review stats + identity_verified.
- ai_commissions(start?, end?, worker?, payment_status?, limit?): totals + top workers + transaction rows.
- ai_complaints(start?, end?, status?, limit?): complaint rows + per-status totals.
- ai_customers(start?, end?, search?, limit?): distinct customers (by phone) with request/completion totals.
- ai_reviews(start?, end?, worker?, limit?): review counts, average rating, rating breakdown, review text.
- ai_cancellations(start?, end?, limit?): cancelled requests with cancellation_reason + old admin_notes.
- ai_notes(start?, end?, entity_type?, limit?): internal admin notes ledger.
- ai_coupons_referrals(start?, end?): coupon usage + referral status.
- ai_timeseries(start, end, granularity): per day/week/month totals (trends, percentages, growth).
- ai_compare(start1, end1, start2, end2): side-by-side overview of two ranges for comparisons.

DATA MODEL (field facts you need when phrasing answers):
- service_requests.status: new, reviewing, assigned, in_progress, completed, cancelled.
- workers.status: pending, approved, rejected, needs_changes, suspended.
- complaints.resolution_status: open, investigating, resolved, dismissed.
- commission.payment_status: due, paid, waived. commission is always 10% of job_amount.
- Completion rate = completed / total requests (%). Keep 1-2 decimals in answers.
- "New customers" in this panel = customers.rows created in the range; "distinct customers" = unique customer_phone counts from requests.
- Cancellation reason for newer cancellations lives in service_requests.cancellation_reason; for older ones check admin_notes in ai_cancellations rows.

Still not possible after calling tools -> say the data is not available, offer what IS available, and stop.
Do not promise to call external services (email/SMS/payments). You are read-only.
`;
}
export function buildTools(): Array<Record<string, unknown>> {
  const dateOrNull = (desc: string) => ({
    type: 'string',
    description: `${desc} Format YYYY-MM-DD. Omit/null to skip the filter.`,
  });

  const commonLimits = {
    type: 'integer',
    description: 'Maximum number of rows to return. Default is fine.',
  };

  return [
    {
      type: 'function',
      function: {
        name: 'ai_overview',
        description:
          'Platform KPIs for a date range: request totals by status, completion rate, new/distinct customers, new workers, job_amount_total, commission_earned_total, paid/due commission, complaint counts, review count. Use for "how many", "totals", "statistics", "summary" questions within a period.',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date of the range.'),
            end_date: dateOrNull('Inclusive end date of the range.'),
          },
          required: ['start_date', 'end_date'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_requests',
        description:
          'Detailed service requests with service/area names, assignments (workers), admin notes, commission and cancellation fields. Use for "list the requests", "who requested", specific request lookups, or request breakdowns.',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            status: {
              type: 'string',
              enum: ['new', 'reviewing', 'assigned', 'in_progress', 'completed', 'cancelled'],
              description: 'Filter by request status.',
            },
            service: { type: 'string', description: 'Filter by service name or id (matches primary or additional services).' },
            area: { type: 'string', description: 'Filter by area id/name.' },
            search: { type: 'string', description: 'Search customer name or problem description text.' },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_workers',
        description:
          'Worker roster with derived stats per worker: jobs summary (completed/cancelled), commission summary (job_amount_total, commission_earned_total, paid, due), rating, review_count, identity_verified. Use for worker questions, comparisons between workers, or "how many workers".',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'needs_changes', 'suspended'],
              description: 'Filter by worker status.',
            },
            service: { type: 'string', description: 'Filter by service name or id (matches primary or additional services).' },
            area: { type: 'string', description: 'Filter by covered area.' },
            search: { type: 'string', description: 'Search worker name or phone.' },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
{
      type: 'function',
      function: {
        name: 'ai_commissions',
        description:
          'Commission transactions for a date range: totals (job_amount_total, commission_earned_total, paid, due, waived), top workers by commission, and transaction rows. Use for commission/revenue/earnings questions, "how much revenue", "who earned most".',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            worker: { type: 'string', description: 'Filter by worker name.' },
            payment_status: { type: 'string', enum: ['due', 'paid', 'waived'], description: 'Filter by payment status.' },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_complaints',
        description:
          'Complaints for a date range: total, by-status breakdown, and complaint rows with worker and request context.',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            status: {
              type: 'string',
              enum: ['open', 'investigating', 'resolved', 'dismissed'],
              description: 'Filter by complaint status.',
            },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_customers',
        description:
          'Distinct customers (by phone) in a date range with first/last request, request counts, completed/cancelled counts and total job amount. Use for "customers", "repeat customers", "who are our customers".',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            search: { type: 'string', description: 'Search by customer name or phone.' },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_reviews',
        description:
          'Review stats for a date range (total, average rating, rating breakdown) and recent review text, optionally filtered to one worker.',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            worker: { type: 'string', description: 'Filter by worker name.' },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
{
      type: 'function',
      function: {
        name: 'ai_cancellations',
        description:
          'Cancelled service requests with cancellation_reason and old admin notes. Use for "cancelled orders", "cancellation reasons", "why was this cancelled". Dates filter on cancelled_at (falling back to created_at for old rows).',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_notes',
        description: 'Internal admin notes ledger. Use when the admin asks about admin notes, remarks, or internal comments.',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
            entity_type: { type: 'string', enum: ['worker', 'request', 'lead'], description: 'Filter by entity type.' },
            limit: commonLimits,
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_coupons_referrals',
        description: 'Coupon usage + referral status for a date range. Use for coupon/referral questions.',
        parameters: {
          type: 'object',
          properties: {
            start_date: dateOrNull('Inclusive start date.'),
            end_date: dateOrNull('Inclusive end date.'),
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_timeseries',
        description:
          'Per day/week/month totals for a range: requests, completed, cancelled, new customers, new workers, revenue (commission_earned_total), job_amount_total, open complaints. Use for trends, growth, percentages, "which day was busiest", month-by-month comparisons.',
        parameters: {
          type: 'object',
          properties: {
            start_date: { type: 'string', description: 'Inclusive start date YYYY-MM-DD.' },
            end_date: { type: 'string', description: 'Inclusive end date YYYY-MM-DD.' },
            granularity: { type: 'string', enum: ['day', 'week', 'month'], description: 'Bucket size.' },
          },
          required: ['start_date', 'end_date', 'granularity'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ai_compare',
        description:
          'Compare two date ranges side by side (same KPIs as ai_overview for each). Use for "this month vs last month", "March vs April", "compare periods", "before vs after".',
        parameters: {
          type: 'object',
          properties: {
            start_date_1: { type: 'string', description: 'Inclusive start date of the first period YYYY-MM-DD.' },
            end_date_1: { type: 'string', description: 'Inclusive end date of the first period YYYY-MM-DD.' },
            start_date_2: { type: 'string', description: 'Inclusive start date of the second period YYYY-MM-DD.' },
            end_date_2: { type: 'string', description: 'Inclusive end date of the second period YYYY-MM-DD.' },
          },
          required: ['start_date_1', 'end_date_1', 'start_date_2', 'end_date_2'],
        },
      },
    },
  ];
}