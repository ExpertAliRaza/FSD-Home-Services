async function verify() {
  const urls = [
    'https://fsd-home-services.vercel.app/',
    'https://fsd-home-services.vercel.app/about',
    'https://fsd-home-services.vercel.app/services/plumber-faisalabad',
    'https://fsd-home-services.vercel.app/services/cctv-technician-faisalabad',
    'https://fsd-home-services.vercel.app/services/solar-technician-faisalabad',
    'https://fsd-home-services.vercel.app/workers',
    'https://fsd-home-services.vercel.app/become-a-worker',
    'https://fsd-home-services.vercel.app/request-service'
  ];

  console.log('🔍 Testing Live Raw HTML Fetch (Simulating AI Crawlers / Googlebot / cURL):');
  console.log('========================================================================');

  for (const url of urls) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } });
    const html = await res.text();
    const hasH1 = /<h1[^>]*>(.*?)<\/h1>/is.exec(html);
    const hasH2 = /<h2[^>]*>(.*?)<\/h2>/is.exec(html);
    const title = /<title>(.*?)<\/title>/is.exec(html);
    const desc = /<meta name="description" content="([^"]+)"/i.exec(html);
    const hasRootContent = html.includes('id="root"><div') || html.includes('id="root"> <div');
    const isBlank = html.includes('id="root"></div>');

    console.log(`\n🌐 [${res.status}] ${url}`);
    console.log(`   🏷️  Title: ${title ? title[1].trim() : 'NONE'}`);
    console.log(`   📝  Description: ${desc ? desc[1].trim().slice(0, 70) + '...' : 'NONE'}`);
    console.log(`   📌  H1: ${hasH1 ? hasH1[1].replace(/<[^>]+>/g, '').trim() : 'NONE'}`);
    console.log(`   📌  First H2: ${hasH2 ? hasH2[1].replace(/<[^>]+>/g, '').trim() : 'NONE'}`);
    console.log(`   📦  Raw HTML Content in #root: ${hasRootContent ? 'YES ✅ (Rendered)' : (isBlank ? 'NO ❌ (Blank)' : 'UNKNOWN')}`);
    console.log(`   📊  HTML Size: ${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(1)} KB`);
  }
}

verify();
