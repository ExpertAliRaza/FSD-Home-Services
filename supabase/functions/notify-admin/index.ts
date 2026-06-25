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
    const { type, entityId } = await request.json();
    if (!['new_customer_request', 'new_worker_signup', 'new_complaint'].includes(type) || !entityId) {
      return json({ error: 'Invalid notification payload.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
    const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL') || 'FSD Home Services <onboarding@resend.dev>';

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !adminEmail) {
      return json({ error: 'Email notification secrets are not configured.' }, 503);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('id, title, message, email_sent_at, created_at')
      .eq('type', type)
      .eq('related_id', entityId)
      .eq('recipient_role', 'admin')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (notificationError || !notification) {
      return json({ error: 'Notification record was not found.' }, 404);
    }
    if (notification.email_sent_at) {
      return json({ success: true, duplicate: true });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: notification.title,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
            <h2 style="color:#087f5b">${escapeHtml(notification.title)}</h2>
            <p>${escapeHtml(notification.message)}</p>
            <p style="color:#64748b;font-size:14px">Open the FSD Home Services admin dashboard to review it.</p>
          </div>
        `
      })
    });

    if (!resendResponse.ok) {
      return json({ error: await resendResponse.text() }, 502);
    }

    await supabase
      .from('notifications')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('type', type)
      .eq('related_id', entityId)
      .eq('recipient_role', 'admin')
      .is('email_sent_at', null);

    return json({ success: true });
  } catch (error) {
    return json({ error: error.message || 'Unexpected notification error.' }, 500);
  }
});

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
