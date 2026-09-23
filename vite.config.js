import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://oksyweagotmzokmdsjtt.supabase.co';
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '').trim();
  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3l3ZWFnb3Rtem9rbWRzanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzU0NjcsImV4cCI6MjEwNTcxMTQ2N30.ty7YtO2uHL_yPbwtE_ML8vNSu8zxI9YSBKVy0LewRVU';

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(cleanUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(anonKey)
    },
    plugins: [
      react(),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-16x16.png', 'favicon-32x32.png', 'logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ClassHub — Portal Kelas',
        short_name: 'ClassHub',
        description: 'Aplikasi Manajemen Kelas, Jadwal Pelajaran, Tugas, Kas, dan Komunitas Siswa',
        theme_color: '#2563EB',
        background_color: '#FAFAF9',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity'],
        lang: 'id',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
    server: {
      port: 3000,
      host: '127.0.0.1',
      open: false
    }
  };
});

