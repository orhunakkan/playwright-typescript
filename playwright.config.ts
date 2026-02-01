import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['list'], ['html'], ['json', { outputFile: 'playwright-report/test-results.json' }]],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.ENV,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      API_BASE_URL: process.env.API_URL,
    },
  },
  projects: [
    {
      name: 'API Tests',
      testDir: './tests/api',
      testMatch: '**/*.spec.ts',
      use: {},
    },

    {
      name: 'Desktop Chrome',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'Desktop Firefox',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'Desktop Edge',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Edge'] },
    },
  ],
});
