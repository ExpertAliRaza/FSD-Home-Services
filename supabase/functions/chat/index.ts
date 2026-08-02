import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const groqApiKey = Deno.env.get('GROQ_API_KEY') || '';

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is missing');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Authenticate user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { message, history = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch dynamic context from DB using service role to bypass RLS for aggregate stats
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
    
    // 1. Fetch Workers
    const { data: workersData } = await adminSupabase.from('workers').select('id, status, display_name, service_category_id, created_at, phone_number, is_verified');
    const totalWorkers = workersData?.length || 0;
    const approvedWorkers = workersData?.filter(w => w.status === 'approved').length || 0;
    const pendingWorkers = workersData?.filter(w => w.status === 'pending').length || 0;

    // 2. Fetch Requests
    const { data: requestsData } = await adminSupabase.from('service_requests').select('id, status, created_at, customer_name, service_category_id, area_id');
    const { data: allNotes } = await adminSupabase.from('admin_notes').select('entity_id, entity_type, note_text, created_at');
    
    // 3. Fetch Complaints
    const { data: complaintsData } = await adminSupabase.from('complaints').select('id, request_id, complaint_text, status, notes, created_at');
    const openComplaints = complaintsData?.filter(c => c.status === 'open').length || 0;

    // 4. Fetch Revenue
    const { data: commissionsData } = await adminSupabase.from('commission_transactions').select('id, request_id, worker_id, job_amount, commission_amount, payment_status, created_at');
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonthStr = todayStr.substring(0, 7);
    
    const getWeekStr = (date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      return d.toISOString().split('T')[0];
    };
    const thisWeekStr = getWeekStr(now);

    let totalRevenue = 0, todayRevenue = 0, weekRevenue = 0, monthRevenue = 0;
    let totalCommission = 0, todayCommission = 0, weekCommission = 0, monthCommission = 0;
    let pendingCommission = 0;

    (commissionsData || []).forEach(item => {
      const jobAmt = Number(item.job_amount || 0);
      const commAmt = Number(item.commission_amount || 0);
      const dateStr = (item.created_at || '').substring(0, 10);
      const monthStr = (item.created_at || '').substring(0, 7);
      const weekStr = getWeekStr(item.created_at);

      totalRevenue += jobAmt;
      totalCommission += commAmt;
      if (item.payment_status === 'due') pendingCommission += commAmt;

      if (dateStr === todayStr) { todayRevenue += jobAmt; todayCommission += commAmt; }
      if (weekStr === thisWeekStr) { weekRevenue += jobAmt; weekCommission += commAmt; }
      if (monthStr === thisMonthStr) { monthRevenue += jobAmt; monthCommission += commAmt; }
    });

    let totalRequests = 0, todayRequests = 0, weekRequests = 0, monthRequests = 0;
    let totalCompleted = 0, todayCompleted = 0, weekCompleted = 0, monthCompleted = 0;
    let totalCancelled = 0, todayCancelled = 0, weekCancelled = 0, monthCancelled = 0;
    
    // Enrich requests with notes
    const fullRequestsData = (requestsData || []).map(req => {
      const reqNotes = allNotes?.filter(n => n.entity_type === 'request' && n.entity_id === req.id).map(n => n.note_text).join(' | ');
      return { ...req, internal_notes: reqNotes || 'None' };
    });

    fullRequestsData.forEach(req => {
      totalRequests++;
      const dateStr = (req.created_at || '').substring(0, 10);
      const monthStr = (req.created_at || '').substring(0, 7);
      const weekStr = getWeekStr(req.created_at);

      const isToday = dateStr === todayStr;
      const isWeek = weekStr === thisWeekStr;
      const isMonth = monthStr === thisMonthStr;

      if (isToday) todayRequests++;
      if (isWeek) weekRequests++;
      if (isMonth) monthRequests++;

      if (req.status === 'completed') {
        totalCompleted++;
        if (isToday) todayCompleted++;
        if (isWeek) weekCompleted++;
        if (isMonth) monthCompleted++;
      } else if (req.status === 'cancelled') {
        totalCancelled++;
        if (isToday) todayCancelled++;
        if (isWeek) weekCancelled++;
        if (isMonth) monthCancelled++;
      }
    });

    const liveContext = `
      LIVE DATABASE CONTEXT (Current Date: ${todayStr}):
      
      [STATS & AGGREGATES]
      Total Workers: ${totalWorkers} (${approvedWorkers} approved, ${pendingWorkers} pending).
      Open Complaints: ${openComplaints}
      
      [REVENUE (Gross Job Value)]
      - Today: Rs ${todayRevenue} | This Week: Rs ${weekRevenue} | This Month: Rs ${monthRevenue} | Total: Rs ${totalRevenue}
      
      [PLATFORM COMMISSION]
      - Today: Rs ${todayCommission} | This Week: Rs ${weekCommission} | This Month: Rs ${monthCommission} | Total: Rs ${totalCommission} (Pending: Rs ${pendingCommission})
      
      [SERVICE REQUESTS STATS]
      - Today: ${todayRequests} total (${todayCompleted} completed, ${todayCancelled} cancelled)
      - This Week: ${weekRequests} total (${weekCompleted} completed, ${weekCancelled} cancelled)
      - This Month: ${monthRequests} total (${monthCompleted} completed, ${monthCancelled} cancelled)
      - Total: ${totalRequests} total (${totalCompleted} completed, ${totalCancelled} cancelled)
      
      [FULL DATABASE RAW DATA FOR CONTEXT AND ANALYSIS]
      The following is the complete dataset of your platform. Analyze this data to answer questions about specific requests, cancellations, worker statuses, reasons, and improvements.
      
      WORKERS:
      ${JSON.stringify(workersData)}
      
      SERVICE REQUESTS (Contains cancellation reasons / internal notes!):
      ${JSON.stringify(fullRequestsData)}
      
      COMPLAINTS:
      ${JSON.stringify(complaintsData)}
      
      COMMISSIONS:
      ${JSON.stringify(commissionsData)}
    `;

    const systemPrompt = `You are an internal AI assistant for the FSD Home Services Admin Panel.
Your purpose is to help the admin by answering questions about the platform's current state based on the live database context provided below.
Rules:
1. Answer ONLY based on the provided LIVE DATABASE CONTEXT.
2. If the user asks something not in the context, clearly state: "Yeh information abhi context mein available nahi hai."
3. Do not guess or make up numbers.
4. You have FULL access to the raw data (Workers, Requests, Notes, Commissions, Complaints). Use this data to answer ANY queries comprehensively. If asked why a request was cancelled, look at its 'internal_notes' in the SERVICE REQUESTS array.
5. Provide improvement suggestions if asked! Use the data to deduce problems.
6. Keep answers concise, professional, and helpful. You can speak in Urdu/English mix (Roman Urdu) or English as requested.
7. NEVER expose raw JSON to the user. Present information in a clean, human-readable format (bullet points, summaries).

${liveContext}
`;

    // Filter history to remove any empty or invalid roles
    const validHistory = history.filter(m => m.role && m.content);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...validHistory,
      { role: 'user', content: message }
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.3,
        max_tokens: 1024,
      })
    });

    if (!groqResponse.ok) {
      const errTxt = await groqResponse.text();
      console.error('Groq Error:', errTxt);
      // Return 200 with error string so frontend can display it cleanly instead of throwing HTTP 500
      return new Response(JSON.stringify({ reply: 'Groq API Error: ' + errTxt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const groqData = await groqResponse.json();
    const reply = groqData.choices?.[0]?.message?.content || 'Sorry, no response generated.';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat error:', error);
    // Return as 200 with error text to avoid generic Edge Function 500 error masking
    return new Response(JSON.stringify({ reply: 'Internal Error: ' + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
