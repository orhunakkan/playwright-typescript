import { defineConfig, devices } from '@playwright/test';
import { AllureReporter } from 'allure-playwright';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{testFileName}-{projectName}{ext}',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [ ['line'], ['allure-playwright'] ],
  use: {
    baseURL: process.env.ENV,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Desktop Chromium',
      testDir: './tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
