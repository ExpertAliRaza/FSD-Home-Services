import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import prerenderer from '@prerenderer/rollup-plugin';
import puppeteer from '@prerenderer/renderer-puppeteer';

export default defineConfig({
  plugins: [
    react(),
    prerenderer({
      routes: [
        '/',
        '/about',
        '/services',
        '/workers',
        '/become-a-worker',
        '/request-service',
        '/contact',
        '/commission-policy',
        '/worker-verification-policy'
      ],
      renderer: new puppeteer({
        renderAfterDocumentEvent: 'custom-render-trigger',
        headless: true
      })
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
