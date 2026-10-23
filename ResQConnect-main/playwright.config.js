import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E & Live Regression Test Configuration for ResQConnect
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 35000,
  expect: {
    timeout: 12000,
  },
  workers: 1, // Single worker avoids hammering live cloud backend and prevents rate limiting
  fullyParallel: false,
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://final-resqconnect-project.vercel.app',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
      },
      testMatch: [/frontend-public\.spec\.js/, /frontend-auth-contrast\.spec\.js/],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome',
      },
      testMatch: [/frontend-responsive\.spec\.js/],
    },
    {
      name: 'live-backend-api',
      testMatch: [/backend-api\.spec\.js/],
    },
  ],
});
