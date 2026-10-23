import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// A separate port from the dev server (3000), so E2E never touches the owner's real database.
const PORT = 3100;
const baseURL = `http://127.0.0.1:${String(PORT)}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // TODO(Phase 4): drop the existsSync guard once src/main.ts exists; until then there is no app to start.
  ...(existsSync('src/main.ts')
    ? {
        webServer: {
          command: 'node src/main.ts',
          url: `${baseURL}/api/health`,
          reuseExistingServer: false,
          env: {
            PORT: String(PORT),
            DB_PATH: join(tmpdir(), 'agentic-job-board-e2e', `${String(Date.now())}.db`),
            LOG_LEVEL: 'warn',
          },
        },
      }
    : {}),
});
