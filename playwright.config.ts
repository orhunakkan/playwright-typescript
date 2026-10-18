import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.ENV}`, override: true });
dotenv.config({ path: '.env' });

// dev/uat are reserved for a future environment promotion pipeline (only prod is wired up,
// via BASE_URL in .env). Fail fast with a clear message instead of letting
// Playwright try to resolve a BASE_URL that was never set and time out obscurely.
const UNAVAILABLE_ENVIRONMENTS = ['dev', 'uat'];
if (process.env.ENV && UNAVAILABLE_ENVIRONMENTS.includes(process.env.ENV)) {
  throw new Error(
    `ENV='${process.env.ENV}' is reserved for an environment that does not exist yet. ` +
      `Only 'prod' (the default — no ENV needed) is supported. See README > Environments.`,
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
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Desktop Edge', use: { ...devices['Desktop Edge'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
  ],
});
