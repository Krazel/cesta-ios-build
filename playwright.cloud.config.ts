import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 12000 },
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/cloud' }]],
  use: {
    baseURL: process.env.CESTA_TEST_URL || 'http://localhost:8788',
    locale: 'es-ES',
    channel: 'chrome',
    headless: true,
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.CESTA_TEST_URL
    ? undefined
    : {
        command: 'npx wrangler dev --port 8788 --local',
        url: 'http://localhost:8788/api/health',
        reuseExistingServer: true,
        timeout: 60000,
      },
});
