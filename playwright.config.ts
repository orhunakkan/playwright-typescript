import { defineConfig, devices } from '@playwright/test';
import { EnvConfig } from './utilities/env-config';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{testFileName}-{projectName}{ext}',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: EnvConfig.getBaseUrl(),
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    // API tests - run only once in Chromium
    {
      name: 'API Tests',
      testMatch: /.*api\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    // E2E tests - run in all browsers
    {
      name: 'Desktop Chromium',
      testMatch: /.*e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Desktop Firefox',
      testMatch: /.*e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'Desktop Edge',
      testMatch: /.*e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Edge'] }
      }
  ]
});
