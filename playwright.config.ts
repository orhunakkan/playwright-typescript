import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.ENV}`, override: true });
dotenv.config({ path: '.env' });

export default defineConfig({
  testDir: './tests',
  testIgnore: process.env.CI ? ['**/scrapper/**'] : [],
  snapshotDir: './fixtures/reference-snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? undefined : undefined,
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
    },
  ],
});
