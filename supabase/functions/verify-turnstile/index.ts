import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, purpose } = await request.json();
    if (!token || !['service_request', 'worker_signup'].includes(purpose)) {
      return json({ error: 'Invalid verification request.' }, 400);
    }

    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!turnstileSecret || !supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Turnstile is not configured.' }, 503);
    }

    const formData = new FormData();
    formData.append('secret', turnstileSecret);
    formData.append('response', token);
    formData.append('idempotency_key', crypto.randomUUID());

    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: formData }
    );
    const verification = await verificationResponse.json();
    if (!verification.success) {
      return json({ error: 'Human verification failed.', codes: verification['error-codes'] }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('turnstile_verifications')
      .insert({ purpose })
      .select('id')
      .single();

    if (error) {
      return json({ error: 'Could not create verification proof.' }, 500);
    }

    return json({ verificationId: data.id });
  } catch (error) {
    return json({ error: error.message || 'Unexpected verification error.' }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
