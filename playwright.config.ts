import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.ENV}`, override: true });
dotenv.config({ path: '.env' });

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
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
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
      testIgnore: '**/service-workers/**',
    },
  ],
});
