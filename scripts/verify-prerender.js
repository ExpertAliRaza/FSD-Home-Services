import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const REQUIRED_ROUTES = [
  '/',
  '/about',
  '/services',
  '/services/plumber-faisalabad',
  '/services/electrician-faisalabad',
  '/services/contractor-faisalabad',
  '/services/construction-renovation-faisalabad',
  '/services/marble-tile-fitting-faisalabad',
  '/services/welding-metal-fabrication-faisalabad',
  '/services/ceiling-faisalabad',
  '/services/waterproofing-faisalabad',
  '/services/cleaning-services-faisalabad',
  '/workers',
  '/become-a-worker',
  '/request-service',
  '/contact'
];

const EXPECTED_CONTENT = {
  '/': ['FSD Home Services', 'Verified Workers', 'Request a Worker'],
  '/about': ['About FSD Home Services', 'Our Mission', 'How FSD Home Services Works'],
  '/services': ['Home Services in Faisalabad', 'Plumber', 'Electrician'],
  '/services/plumber-faisalabad': ['Plumber in Faisalabad', 'Request a Plumber in Faisalabad'],
  '/services/electrician-faisalabad': ['Electrician in Faisalabad', 'Request an Electrician in Faisalabad'],
  '/services/contractor-faisalabad': ['Contractor in Faisalabad', 'Request a Contractor in Faisalabad'],
  '/services/construction-renovation-faisalabad': ['Construction & Renovation in Faisalabad', 'Request Construction & Renovation Services in Faisalabad'],
  '/services/marble-tile-fitting-faisalabad': ['Marble & Tile Fitting in Faisalabad', 'Request Marble & Tile Fitting in Faisalabad'],
  '/services/welding-metal-fabrication-faisalabad': ['Welding & Metal Fabrication in Faisalabad', 'Request Welding & Metal Fabrication in Faisalabad'],
  '/services/ceiling-faisalabad': ['Ceiling / False Ceiling in Faisalabad', 'Request Ceiling Services in Faisalabad'],
  '/services/waterproofing-faisalabad': ['Waterproofing in Faisalabad', 'Request Waterproofing Services in Faisalabad'],
  '/services/cleaning-services-faisalabad': ['Cleaning Services in Faisalabad', 'Request Cleaning Services in Faisalabad'],
  '/workers': ['Verified Workers in Faisalabad', 'Worker'],
  '/become-a-worker': ['Become an approved FSD Home Services worker', 'Worker verification'],
  '/request-service': ['Request a Worker in Faisalabad', 'Submit a free request'],
  '/contact': ['Customer Care', 'Contact Customer Care']
};

function getRouteFilePath(route) {
  if (route === '/') {
    return path.join(distDir, 'index.html');
  }
  return path.join(distDir, route.replace(/^\//, ''), 'index.html');
}

function stripTags(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function verifyRoute(route) {
  const filePath = getRouteFilePath(route);
  if (!fs.existsSync(filePath)) {
    return { ok: false, error: `Missing pre-rendered file: ${filePath}` };
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const bodyText = stripTags(html);
  const expectedStrings = EXPECTED_CONTENT[route] || [];

  const missing = expectedStrings.filter((text) => !bodyText.includes(text));
  if (missing.length > 0) {
    return { ok: false, error: `Missing expected content in ${route}: ${missing.join(', ')}` };
  }

  if (bodyText.length < 300) {
    return { ok: false, error: `Pre-rendered HTML for ${route} is too short (${bodyText.length} chars).` };
  }

  return { ok: true, size: html.length };
}

function runVerification() {
  console.log('🔍 Verifying pre-rendered HTML...');
  let failures = 0;

  for (const route of REQUIRED_ROUTES) {
    const result = verifyRoute(route);
    if (result.ok) {
      console.log(`✅ ${route.padEnd(45)} (${result.size} bytes)`);
    } else {
      console.error(`❌ ${route.padEnd(45)} ${result.error}`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\n❌ Pre-render verification failed for ${failures} route(s).`);
    process.exit(1);
  }

  console.log('\n🎉 Pre-render verification passed for all required routes.');
}

runVerification();
