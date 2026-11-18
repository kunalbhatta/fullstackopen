import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': process.env.BLOG_API_ORIGIN || 'http://127.0.0.1:3001' },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.jsx'],
    setupFiles: ['tests/setup.js'],
  },
})
