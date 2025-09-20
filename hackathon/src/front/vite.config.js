import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['tabebui.com'],
    proxy: {
      // ブラウザからは /api にアクセス → Node(Vite) が app_server:8000 にプロキシ
      '/api': {
        target: 'http://server:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

