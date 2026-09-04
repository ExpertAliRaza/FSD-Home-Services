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

function createStaticServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://localhost:${port}`);
      let filePath = path.join(distDir, decodeURIComponent(parsedUrl.pathname));

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
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
    });

    server.listen(port, () => resolve(server));
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
    console.warn('⚠️ Standard Puppeteer launch failed, attempting fallback...', error.message);
    try {
      const { chromium } = await import('@sparticuz/chromium');
      return await chromium.launch(launchOptions);
    } catch (fallbackError) {
      console.error('❌ Both standard Puppeteer and @sparticuz/chromium fallback failed.', fallbackError.message);
      throw new Error('No headless browser available for pre-rendering.');
    }
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
  return text.length < 300 || !text.includes('FSD Home Services');
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
  const port = 5174;
  const server = await createStaticServer(port);
  console.log(`📡 Local preview server running on port ${port}`);

  const originalShellPath = path.join(distDir, 'index.html');
  let originalShell = fs.existsSync(originalShellPath)
    ? fs.readFileSync(originalShellPath, 'utf8')
    : null;

  let browser;
  try {
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const route of routes) {
      const url = `http://localhost:${port}${route}`;
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
    console.error('❌ Pre-rendering failed:', error.message);
    process.exitCode = 1;
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
