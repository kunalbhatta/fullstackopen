const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './e2e-tests',
  use: { baseURL: 'http://127.0.0.1:5300' },
  webServer: {
    command: 'npm run start-prod',
    env: { PORT: '5300' },
    url: 'http://127.0.0.1:5300/health',
  },
})
