import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        runtimeCaching: [
          {
            // Cache requests through the Vercel proxy (/api/owm) in production
            urlPattern: /\/api\/owm(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 },
              cacheableResponse: { statuses: [200] }
            }
          },
          {
            // Cache direct OWM calls (used in dev mode and with custom user keys)
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'SkyPulse Weather Dashboard',
        short_name: 'SkyPulse',
        description: 'Premium weather dashboard with forecasts, maps, and alerts',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: true,
    // In dev, proxy /api/owm → OWM directly using the local VITE_ key.
    // In production, Vercel routes /api/owm to api/owm.js (server-side key, never bundled).
    proxy: {
      '/api/owm': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const endpoint = url.searchParams.get('endpoint') || '';
          url.searchParams.delete('endpoint');
          return endpoint + '?' + url.searchParams.toString();
        },
      },
    },
  }
})
