import { test, expect } from '../../fixtures/index.ts';

// Seed for Playwright's planner and generator agents (tests/e2e is the chromium project's testDir).
// Generated tests start from this page state and copy this import style. Signed out.
// Pass it explicitly: seedFile "tests/e2e/seed.spec.ts".
test('seed: signed out on the catalogue', { tag: '@seed' }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-name').first()).toBeVisible();
});
