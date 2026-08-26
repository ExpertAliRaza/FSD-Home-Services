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
  return new Promise((resolve) => {
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
  });
}

function getExecutablePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

async function runPrerender() {
  console.log('🚀 Starting Pre-rendering (SSG Snapshot)...');
  const port = 5174;
  const server = await createStaticServer(port);
  console.log(`📡 Local preview server running on port ${port}`);

  let browser;
  try {
    const execPath = getExecutablePath();
    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    };
    if (execPath) {
      launchOptions.executablePath = execPath;
      console.log(`🧭 Using browser executable: ${execPath}`);
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const route of routes) {
      const url = `http://localhost:${port}${route}`;
      process.stdout.write(`⏳ Pre-rendering ${route.padEnd(40)} `);

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {
        // Fallback if networkidle0 times out
      });

      // Wait for React to mount and RouteMeta to apply
      await page.waitForSelector('#root > *', { timeout: 5000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 600));

      const html = await page.content();

      // Determine output file path
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
    console.error('❌ Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

runPrerender();
