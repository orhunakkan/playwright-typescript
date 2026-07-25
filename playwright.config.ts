import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.ENV}`, override: true });
dotenv.config({ path: '.env' });

// dev/uat are reserved for a future environment promotion pipeline (portfolio-only right now —
// only prod is a real, live target). Fail fast with a clear message instead of letting
// Playwright try to resolve a BASE_URL that was never set and time out obscurely.
const UNAVAILABLE_ENVIRONMENTS = ['dev', 'uat'];
if (process.env.ENV && UNAVAILABLE_ENVIRONMENTS.includes(process.env.ENV)) {
  throw new Error(
    `ENV='${process.env.ENV}' is reserved for an environment that does not exist yet. ` +
      `Only 'prod' (the default — no ENV needed) currently points to a live target. See README > Environments.`,
  );
}

export default defineConfig({
  testDir: './tests',
  snapshotDir: './fixtures/reference-snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: undefined,
  outputDir: 'test-results',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }], ['json', { outputFile: 'playwright-report/results.json' }]],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
      // TAB1-67: Book Catalog is backed by one real, shared, persistent Azure SQL database
      // with no per-session isolation. The CI matrix runs all 4 browser projects as separate,
      // truly parallel jobs, and this lab's Reset/reseed calls collide across them (confirmed
      // directly: concurrent reseeds produced corrupted row counts, e.g. 24 = 2x12 duplicated
      // rows). Explicit team scope decision: this lab runs on Desktop Edge only; all other
      // labs keep full 4-browser coverage.
      testIgnore: '**/book-catalog/**',
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
      // TAB1-67: see the Desktop Chrome project comment — Book Catalog is Edge-only.
      testIgnore: '**/book-catalog/**',
    },
    {
      name: 'Desktop Edge',
      use: { ...devices['Desktop Edge'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
      // TAB1-53: Playwright's WebKit driver blocks an active service worker from ever
      // responding once context.setOffline(true) is set — confirmed with a raw fetch() call, no
      // app/test code involved. Not fixable in this app's source. Explicit team scope decision:
      // this lab is not run on Safari; all other labs keep full 4-browser coverage.
      // TAB1-67: see the Desktop Chrome project comment — Book Catalog is Edge-only too.
      testIgnore: ['**/service-workers/**', '**/book-catalog/**'],
    },
  ],
});
