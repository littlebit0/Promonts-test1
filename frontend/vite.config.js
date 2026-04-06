import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Promonts',
        short_name: 'Promonts',
        description: '상명대학교 학사 관리 시스템',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
  define: {
    'global': 'globalThis',
  },
  build: {
    // 소스맵 비활성화 (프로덕션)
    sourcemap: false,
    // CSS 코드 분리
    cssCodeSplit: true,
    // 최소 청크 크기 (너무 잘게 쪼개지 않도록)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Chart.js 분리
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'chart-vendor';
            // WebSocket 분리
            if (id.includes('@stomp') || id.includes('sockjs')) return 'ws-vendor';
            // QR 분리
            if (id.includes('qrcode')) return 'qr-vendor';
            // React 코어
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            // lucide-react 아이콘 분리 (크기가 큰 편)
            if (id.includes('lucide-react')) return 'icons-vendor';
          }
        },
        // 청크 파일명 패턴
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // 트리쉐이킹 (chart.js는 side-effects 있으므로 기본값 유지)
      treeshake: {
        propertyReadSideEffects: false,
      },
    },
    // minify 기본값 사용 (esbuild 미설치 환경 대응)
    // minify: 'esbuild',
    target: 'es2020',
  },
  // 의존성 사전 번들링 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@stomp/stompjs',
      'sockjs-client',
    ],
    exclude: ['lucide-react'],
  },
})
