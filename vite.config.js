import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import prerenderer from '@prerenderer/rollup-plugin';
import JSDOMRenderer from '@prerenderer/renderer-jsdom';

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
      renderer: new JSDOMRenderer({
        renderAfterDocumentEvent: 'custom-render-trigger'
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
