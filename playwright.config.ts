import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,

  reporter: isCI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']]
    : [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.amazon.in',
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
    locale: 'en-IN',
    ignoreHTTPSErrors: false,
    extraHTTPHeaders: {
      'Accept-Language': 'en-IN,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  },

  projects: [
    // In CI we rely on the Playwright-bundled Chromium; locally 'chrome' is preferred.
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(isCI ? {} : { channel: 'chrome' }) } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  outputDir: 'test-results',
});
