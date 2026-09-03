import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Preparing Build Output API format for Vercel...');

const outputDir = path.join(process.cwd(), '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');

if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Copy dist to static
console.log('Copying prebuilt dist/ to .vercel/output/static/...');
const distPath = path.join(process.cwd(), 'dist');
fs.cpSync(distPath, staticDir, { recursive: true });

// Create config
console.log('Creating Vercel config.json...');
fs.writeFileSync(
  path.join(outputDir, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/((?!google[a-z0-9]+\\.html).*)', dest: '/index.html' }
    ]
  }, null, 2)
);

// Deploy
console.log('Deploying pre-rendered build to Vercel production...');
const token = process.env.VERCEL_TOKEN;
const vercelCli = path.join(process.cwd(), 'node_modules', 'vercel', 'dist', 'index.js');
const tokenArg = token ? ` --token ${token}` : '';
execSync(`node "${vercelCli}" deploy --prebuilt --prod --yes${tokenArg}`, { stdio: 'inherit' });

console.log('🎉 Deployment complete!');
