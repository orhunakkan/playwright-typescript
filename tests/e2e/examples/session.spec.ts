import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME } from '../../../utilities/users.ts';

test.describe('signed-in session', () => {
  test.use({ storageState: AUTH_FILE });

  test('positive: signed-in user sees their name in the navigation', { tag: '@example' }, async ({ page }) => {
    await page.goto('/account');

    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toHaveText(`${TEST_USER_NAME.first} ${TEST_USER_NAME.last}`);
  });
});
