const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qdvlzjifwnuejcuoicxi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdmx6amlmd251ZWpjdW9pY3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDIxNTczNCwiZXhwIjoyMDU1NzkxNzM0fQ.zFvE7h5m-N2XQ3U8L2y0P6i8oY3O4E2S0s6A7D9H0lI'
);

async function checkSize() {
  const { data: w } = await supabase.from('workers').select('*');
  const { data: r } = await supabase.from('service_requests').select('*');
  const { data: n } = await supabase.from('admin_notes').select('*');
  const { data: c } = await supabase.from('commission_transactions').select('*');
  
  console.log('Workers:', JSON.stringify(w).length, 'bytes');
  console.log('Requests:', JSON.stringify(r).length, 'bytes');
  console.log('Notes:', JSON.stringify(n).length, 'bytes');
  console.log('Commissions:', JSON.stringify(c).length, 'bytes');
}

checkSize();
