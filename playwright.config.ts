import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? '100%' : '50%',
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8080',
    testIdAttribute: 'data-testid',
    viewport: { width: 1920, height: 1080 },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Capture screenshot after each test failure: https://playwright.dev/docs/test-use-options#recording-options */
    screenshot: 'only-on-failure',
    /* Capture video */
    video: 'on-first-retry',
  },
  // increased as some tests are slow in CI (e.g. co-expression)
  expect: { timeout: 30000 },
  timeout: 3 * 1000 * 60,
  globalTimeout: 10 * 60 * 1000,
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 }, storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'yarn start dev_server_only=true',
      url: 'http://127.0.0.1:8080',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'make start',
      url: 'http://127.0.0.1:9000/health',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
