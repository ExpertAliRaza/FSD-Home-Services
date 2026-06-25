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
    const { phone, password, fullName, cnicNumber, verificationId } = await request.json();
    if (!/^03[0-9]{9}$/.test(phone || '')) {
      return json({ error: 'Enter a valid Pakistani mobile number.' }, 400);
    }
    if (typeof password !== 'string' || password.length < 8) {
      return json({ error: 'Password must be at least 8 characters.' }, 400);
    }
    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100) {
      return json({ error: 'Enter a valid worker name.' }, 400);
    }
    if (!/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(cnicNumber || '')) {
      return json({ error: 'Enter a valid CNIC.' }, 400);
    }
    if (!verificationId) {
      return json({ error: 'Human verification is required.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Worker account service is not configured.' }, 503);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: verificationAccepted, error: verificationError } = await supabase.rpc(
      'consume_turnstile_verification',
      {
        p_verification_id: verificationId,
        p_purpose: 'worker_signup'
      }
    );
    if (verificationError || !verificationAccepted) {
      return json({ error: 'Human verification expired. Please complete it again.' }, 400);
    }

    const activeStatuses = ['pending', 'approved', 'needs_changes', 'suspended'];
    const [{ data: phoneWorker }, { data: cnicWorker }] = await Promise.all([
      supabase
        .from('workers')
        .select('id')
        .eq('phone', phone)
        .in('status', activeStatuses)
        .maybeSingle(),
      supabase
        .from('workers')
        .select('id')
        .eq('cnic_number', cnicNumber)
        .in('status', activeStatuses)
        .maybeSingle()
    ]);
    if (phoneWorker) {
      return json({ error: 'An active worker application already exists with this phone number.' }, 409);
    }
    if (cnicWorker) {
      return json({ error: 'An active worker application already exists with this CNIC number.' }, 409);
    }

    const authEmail = workerAuthEmail(phone);
    const { data, error } = await supabase.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        role: 'worker',
        worker_phone: phone
      }
    });

    if (error) {
      const duplicate = error.message.toLowerCase().includes('already');
      return json({
        error: duplicate
          ? 'A worker account already exists with this phone number. Sign in or use the correct password.'
          : error.message
      }, duplicate ? 409 : 400);
    }

    return json({ userId: data.user.id, authEmail });
  } catch (error) {
    return json({ error: error.message || 'Could not create worker account.' }, 500);
  }
});

function workerAuthEmail(phone: string) {
  return `w92${phone.slice(1)}@auth.fsdhomeservices.pk`;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
