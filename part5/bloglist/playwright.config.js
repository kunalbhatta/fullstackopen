import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5175', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'node --env-file-if-exists=.env --env-file-if-exists=.env.test index.js --test-server',
      cwd: fileURLToPath(new URL('../../part4/bloglist/', import.meta.url)),
      env: { PORT: '3303' },
      url: 'http://127.0.0.1:3303/api/blogs',
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort',
      env: { BLOG_API_ORIGIN: 'http://127.0.0.1:3303' },
      url: 'http://127.0.0.1:5175',
    },
  ],
})
