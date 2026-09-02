async function testAll() {
  const routes = [
    '/',
    '/about',
    '/services',
    '/services/plumber-faisalabad',
    '/services/cctv-technician-faisalabad',
    '/workers'
  ];

  for (const route of routes) {
    const url = 'https://fsd-home-services.vercel.app' + route;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'curl/8.4.0',
        'Accept': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
    const text = await res.text();
    const isBlank = text.includes('<div id="root"></div>');
    const h1Match = /<h1[^>]*>(.*?)<\/h1>/is.exec(text);
    const titleMatch = /<title>(.*?)<\/title>/is.exec(text);

    console.log(`\n========================================`);
    console.log(`ROUTE: ${route}`);
    console.log(`HTTP Status: ${res.status}`);
    console.log(`Size: ${(text.length / 1024).toFixed(1)} KB`);
    console.log(`Blank root (<div id="root"></div>): ${isBlank ? 'YES (BLANK!) ❌' : 'NO ✅'}`);
    console.log(`Title: ${titleMatch ? titleMatch[1] : 'NONE'}`);
    console.log(`H1: ${h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NONE'}`);
    
    // Find body
    const bodyStart = text.indexOf('<body');
    console.log(`Body snippet (150 chars):`, text.slice(bodyStart, bodyStart + 150).replace(/\s+/g, ' '));
  }
}

testAll();
