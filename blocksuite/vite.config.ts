import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    dedupe: ['yjs', 'y-protocols'],
    alias: {
      'yjs': resolve(__dirname, 'node_modules/yjs/dist/yjs.mjs'),
    }
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' http://localhost:2002 http://localhost:3000 http://localhost:3001",
    },
    cors: true,
  },
})
