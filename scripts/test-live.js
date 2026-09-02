async function test() {
  const url = 'https://fsd-home-services.vercel.app/?_nocache=' + Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': 'curl/8.0' } });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Total Response Length:', text.length);
  console.log('Is root empty (<div id="root"></div>):', text.includes('id="root"></div>'));
  console.log('Has pre-rendered content:', text.includes('Hire Verified Plumbers'));
  const bodyIdx = text.indexOf('<body');
  console.log('Body snippet:\n', text.slice(bodyIdx, bodyIdx + 400));
}
test();
