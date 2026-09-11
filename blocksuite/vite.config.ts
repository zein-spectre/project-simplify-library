import { defineConfig } from 'vite'

export default defineConfig({
  // BlockSuite uses web components — no framework plugin needed

  server: {
    // Izinkan di-embed sebagai iframe dari Next.js (port 3000)
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' http://localhost:3000 http://localhost:3001",
    },
    cors: true,
  },
})
