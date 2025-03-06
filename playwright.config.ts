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
