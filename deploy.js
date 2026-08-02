import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Preparing Build Output API format for Vercel...');

const outputDir = path.join(process.cwd(), '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');

if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Copy dist to static
console.log('Copying prebuilt dist/ to .vercel/output/static/...');
// For cross-platform (mostly for Windows user):
try {
  execSync('xcopy /E /I /Y dist\\* .vercel\\output\\static\\', { stdio: 'inherit' });
} catch (e) {
  // Ignore error if already copied or use a fallback
}

// Create config
console.log('Creating Vercel config.json...');
fs.writeFileSync(
  path.join(outputDir, 'config.json'),
  JSON.stringify({ version: 3 }, null, 2)
);

// Deploy
console.log('Deploying to Vercel...');
execSync('npx vercel deploy --prebuilt --prod --yes', { stdio: 'inherit' });

console.log('Deployment complete!');
