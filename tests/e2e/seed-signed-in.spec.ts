import { test, expect } from '../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../utilities/users.ts';

// Seed for Playwright's planner and generator agents, for scenarios that need a signed-in user.
// Uses the run user saved by tests/setup/auth.setup.ts. Pass it explicitly:
// seedFile "tests/e2e/seed-signed-in.spec.ts".
test.use({ storageState: AUTH_FILE });

test('seed: signed in on the account page', { tag: '@seed' }, async ({ page }) => {
  await page.goto('/account');
  await expect(page.getByTestId('nav-menu')).toHaveText(`${TEST_USER_NAME.first} ${TEST_USER_NAME.last}`);
});
