// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // base path للـ frontend (نفس الموجود عندك)
  const base = env.VITE_BASE_PATH || '/'

  // أصل الباك (Laravel) — غيّره من .env إذا لزم
  // مثال في .env:  VITE_BACKEND_ORIGIN=http://localhost:8000
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost:8000'

  return {
    base,
    plugins: [react()],

    // 👇 البروكسي يشتغل فقط في dev (npm run dev)
    server: {
      proxy: {
        '/storage': {
          target: backendOrigin,
          changeOrigin: true,
          // إضافة ميدل وير لمعالجة الأخطاء
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy Error:', err.message)
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
              }
              res.end('خطأ في تحميل الملف من السيرفر: ' + err.message)
            })
          },
        },
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy Error:', err.message)
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
              }
              res.end('خطأ في تحميل الملف من السيرفر: ' + err.message)
            })
          },
        },
      },
    },
  }
})
