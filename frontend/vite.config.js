import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Workout Master',
        short_name: 'WM',
        description: 'AI-powered progressive overload training platform with real-time session tracking.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['fitness', 'health', 'sports'],
      },
      workbox: {
        // Cache static assets aggressively
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching for API responses (stale-while-revalidate)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache analytics dashboard for offline graceful fallback
            urlPattern: /\/api\/analytics\/dashboard/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'analytics-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 }, // 1 hour
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: {
        // Enable PWA in dev mode for testing
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual code splitting to reduce the 861kb bundle
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          clerk: ['@clerk/clerk-react'],
          socket: ['socket.io-client'],
        },
      },
    },
  },
  // Load .env files from project root
  envDir: path.resolve(__dirname, ''),
})
