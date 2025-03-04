import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{testFileName}-{projectName}{ext}',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [],
  use: {
    baseURL: process.env.ENV,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'Desktop Chromium',
      testDir: './tests',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Desktop Firefox',
      testDir: './tests',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'Desktop Edge',
      testDir: './tests',
      use: { ...devices['Desktop Edge'] }
    }
  ]
});
