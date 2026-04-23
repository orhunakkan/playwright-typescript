import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

const envFile = process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env';
dotenv.config({ path: envFile });

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html'],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        environmentInfo: {
          appUrl: process.env.PRACTICE_E2E_URL,
          apiUrl: process.env.PRACTICE_API_URL,
          environment: process.env.TEST_ENV ?? 'dev',
          node: process.versions.node,
        },
      },
    ],
  ],
  outputDir: 'test-results',
  snapshotPathTemplate: 'fixtures/reference-snapshots/{testFileName}/{testName}/{projectName}-{arg}{ext}',
  use: {
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'DB Tests',
      testDir: './tests/db',
      testMatch: '**/*.spec.ts',
      use: {},
    },

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

    {
      name: 'Mobile Safari',
      testDir: './tests/e2e',
      use: { ...devices['iPhone 15 Pro Max'] },
    },

    {
      name: 'Mobile Chrome',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 7'] },
    },

    {
      name: 'sauce-auth-setup',
      testDir: './tests/sauce',
      testMatch: '**/*.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'Sauce Auth Chrome',
      testDir: './tests/sauce',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/sauce-user.json',
      },
      dependencies: ['sauce-auth-setup'],
    },
  ],
});
