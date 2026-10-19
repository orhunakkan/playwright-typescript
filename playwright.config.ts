import { defineConfig, devices, type Project } from '@playwright/test';
import { env } from './config/env.ts';

const desktopChrome = devices['Desktop Chrome'];

const e2e = (name: string, device: string): Project => ({
  name,
  testDir: './tests/e2e',
  dependencies: ['setup'],
  use: { ...devices[device] },
});

// Visual baselines are only valid from the pinned Linux image, so the project exists only when
// scripts/docker-playwright.ts sets PW_VISUAL=1. A host run can never create or compare them.
const visual: Project[] =
  process.env['PW_VISUAL'] === '1' ? [{ name: 'visual', testDir: './tests/visual', dependencies: ['setup'], use: { ...desktopChrome } }] : [];

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 1,
  outputDir: 'test-results',
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
  },
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'reports/results.json' }]],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: env.testIdAttribute,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testDir: './tests/setup', testMatch: '**/*.setup.ts', use: { ...desktopChrome } },
    e2e('chromium', 'Desktop Chrome'),
    e2e('firefox', 'Desktop Firefox'),
    e2e('webkit', 'Desktop Safari'),
    e2e('mobile-chrome', 'Pixel 8'),
    e2e('mobile-safari', 'iPhone 16'),
    { name: 'api', testDir: './tests/api', use: { baseURL: env.apiUrl } },
    { name: 'a11y', testDir: './tests/a11y', dependencies: ['setup'], use: { ...desktopChrome } },
    // One worker keeps perf tests from competing with each other; run via `npm run test:perf` for clean numbers.
    { name: 'perf', testDir: './tests/perf', dependencies: ['setup'], workers: 1, use: { ...desktopChrome } },
    ...visual,
  ],
});
