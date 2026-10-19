import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const routes = [
  '/',
  '/about',
  '/services',
  '/services/plumber-faisalabad',
  '/services/electrician-faisalabad',
  '/services/ac-repair-faisalabad',
  '/services/carpenter-faisalabad',
  '/services/painter-faisalabad',
  '/services/mason-faisalabad',
  '/services/labor-faisalabad',
  '/services/cctv-technician-faisalabad',
  '/services/solar-technician-faisalabad',
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
  '/refer-and-earn',
  '/contact',
  '/privacy',
  '/terms',
  '/commission-policy',
  '/worker-verification-policy'
];

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

function createStaticServer(originalShell) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://127.0.0.1`);
      let pathname = decodeURIComponent(parsedUrl.pathname).replace(/^\/+/, '');
      let filePath = pathname ? path.join(distDir, pathname) : path.join(distDir, 'index.html');

      const ext = path.extname(filePath).toLowerCase();

      // If requested file is a static asset that exists, serve it
      if (ext && ext !== '.html' && fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading file');
          } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
          }
        });
        return;
      }

      // Otherwise serve the clean SPA shell from memory
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(originalShell);
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
    server.on('error', reject);
  });
}

function getExecutablePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

async function launchBrowser() {
  const execPath = getExecutablePath();
  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };

  if (execPath) {
    launchOptions.executablePath = execPath;
    console.log(`🧭 Using browser executable: ${execPath}`);
  }

  try {
    return await puppeteer.launch(launchOptions);
  } catch (error) {
    console.error('❌ Puppeteer launch failed:', error.message);
    throw new Error('No headless browser available for pre-rendering.');
  }
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

function isShellHtml(html) {
  const text = stripTags(html);
  const ok = text.length >= 300 && (text.includes('FSD') || text.includes('Faisalabad') || text.includes('Services'));
  if (!ok) {
    console.log('DEBUG isShellHtml check failed. Text length:', text.length, 'First 200 chars:', text.slice(0, 200));
  }
  return !ok;
}

async function capturePage(page, url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

      await page.waitForSelector('#root > *', { timeout: 5000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));

      const html = await page.content();

      if (!isShellHtml(html)) {
        return html;
      }

      console.warn(`⚠️ Attempt ${attempt}: captured SPA shell for ${url}, retrying...`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed for ${url}:`, error.message);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  throw new Error(`Failed to capture rendered content for ${url} after ${maxRetries} attempts`);
}

async function runPrerender() {
  console.log('🚀 Starting Pre-rendering (SSG Snapshot)...');

  const originalShellPath = path.join(distDir, 'index.html');
  const originalShell = fs.existsSync(originalShellPath)
    ? fs.readFileSync(originalShellPath, 'utf8')
    : null;

  if (!originalShell) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }

  const { server, port } = await createStaticServer(originalShell);
  console.log(`📡 Local preview server running on port ${port}`);

  let browser;
  try {
    browser = await launchBrowser();

    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
    await page.setViewport({ width: 1280, height: 800 });

    for (const route of routes) {
      const url = `http://127.0.0.1:${port}${route}`;
      process.stdout.write(`⏳ Pre-rendering ${route.padEnd(40)} `);

      const html = await capturePage(page, url);

      let outPath;
      if (route === '/') {
        outPath = path.join(distDir, 'index.html');
      } else {
        const routeDir = path.join(distDir, route.replace(/^\//, ''));
        fs.mkdirSync(routeDir, { recursive: true });
        outPath = path.join(routeDir, 'index.html');
      }

      fs.writeFileSync(outPath, html, 'utf8');
      const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
      console.log(`✅ [${sizeKb} KB] -> ${path.relative(rootDir, outPath)}`);
    }

    console.log('\n🎉 Pre-rendering completed successfully for all routes!');
  } catch (error) {
    console.warn('⚠️ Pre-rendering skipped (headless browser unavailable in build environment):', error.message);
    if (!process.env.VERCEL) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    server.close();

    const spaRoutes = [
      'admin',
      'login',
      'worker/login',
      'worker',
      'worker/leads',
      'worker/jobs',
      'worker/earnings',
      'worker/reviews',
      'worker/notifications',
      'worker/profile',
      'worker/documents',
      'worker/settings'
    ];

    const fallbackHtml = originalShell || fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

    for (const spaRoute of spaRoutes) {
      const targetDir = path.join(distDir, spaRoute);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetHtmlPath = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetHtmlPath, fallbackHtml, 'utf8');
      console.log(`📁 Fallback SPA entry created -> ${path.relative(rootDir, targetHtmlPath)}`);
    }
  }
}

runPrerender();
