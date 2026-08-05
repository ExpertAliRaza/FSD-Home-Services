import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import './styles.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys
        .filter((key) => key.startsWith('fsd-home-services-'))
        .forEach((key) => caches.delete(key));
    });
  }
}

import { CatalogProvider } from './contexts/CatalogContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CatalogProvider>
      <RouterProvider router={router} />
    </CatalogProvider>
  </React.StrictMode>
);

// Trigger for prerenderer bot
setTimeout(() => {
  document.dispatchEvent(new Event('custom-render-trigger'));
}, 500); // 500ms delay to ensure all async initial loads complete
