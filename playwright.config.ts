import { defineConfig, devices } from '@playwright/test';

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
    baseURL: 'https://the-internet.herokuapp.com/',
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
