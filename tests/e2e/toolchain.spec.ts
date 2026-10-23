// Phase 0 placeholder: proves Playwright runs on every project. Real E2E tests arrive in Phase 6.
import { expect, test } from '@playwright/test';

test('NFR-01: E2E targets the loopback address @smoke', ({ baseURL }) => {
  expect(baseURL).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
});
