import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './utilities/environments';

const env = process.env.env || 'dev';
const environment = getEnvironment(env);

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: environment.baseURL,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'Desktop Edge',
      use: { ...devices['Desktop Edge'] }
    }
  ]
});
