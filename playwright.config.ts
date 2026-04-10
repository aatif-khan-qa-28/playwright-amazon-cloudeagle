import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

/**
 * Playwright configuration.
 *
 * - Local: 1 worker, Chromium only (fast feedback loop).
 * - CI:    1 worker (cart state is shared; parallel workers risk interference),
 *          all three browser engines, 2 retries per test, GitHub annotations.
 *
 * Cross-browser scope is intentionally limited to CI so local runs stay fast.
 * Override on demand:  npx playwright test --project=firefox
 */
export default defineConfig({
  testDir: './tests',

  /* Global test timeout (per test) */
  timeout: 90_000,

  /* Expect assertion timeout */
  expect: {
    timeout: 15_000,
  },

  /* Run tests in parallel within a file — disabled because E2E flows share cart state */
  fullyParallel: false,

  /* Prevent accidental test.only() from reaching the pipeline */
  forbidOnly: isCI,

  /* Retry on CI only */
  retries: isCI ? 2 : 0,

  /**
   * 1 worker both locally and on CI.
   * These E2E tests hit a live e-commerce site with shared session/cart state.
   * Multiple workers would cause tests to interfere with each other's cart.
   * To run suites in parallel, isolate them via separate browser contexts or accounts.
   */
  workers: 1,

  /* Rich multi-reporter setup */
  reporter: isCI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']]
    : [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],

  use: {
    /* Base URL from .env */
    baseURL: process.env.BASE_URL ?? 'https://www.amazon.in',

    /* Always run headless */
    headless: true,

    viewport: { width: 1440, height: 900 },

    /* Capture trace on first retry for debugging */
    trace: 'on-first-retry',

    /* Screenshot and video only on failure */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Reasonable navigation/action timeouts */
    navigationTimeout: 60_000,
    actionTimeout: 15_000,

    /* Locale for consistent date/currency formatting */
    locale: 'en-IN',

    /* Do not silently swallow HTTPS errors */
    ignoreHTTPSErrors: false,

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-IN,en;q=0.9',
      // Mimic a real browser to reduce bot-detection hits on CI runners
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  },

  projects: [
    /* ── Desktop browsers ────────────────────────────────────────────────── */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* ── Mobile browsers ─────────────────────────────────────────────────── */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  /* Output folder for test artefacts */
  outputDir: 'test-results',
});
