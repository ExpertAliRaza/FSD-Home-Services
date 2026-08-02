const ref = 'qdvlzjifwnuejcuoicxi';
const token = process.env.SUPABASE_ACCESS_TOKEN || '';

async function run() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
