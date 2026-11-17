import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'part3') {
    return {
      server: {
        proxy: { '/api': 'http://127.0.0.1:3001' },
      },
    }
  }

  return {}
})
