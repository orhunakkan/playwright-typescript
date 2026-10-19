import { test, expect } from '../../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME, signInAs } from '../../../utilities/users.ts';

test.describe('signed-in session', () => {
  test.use({ storageState: AUTH_FILE });

  test('positive: signed-in user sees their name in the navigation', { tag: '@example' }, async ({ page }) => {
    await page.goto('/account');

    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toHaveText(`${TEST_USER_NAME.first} ${TEST_USER_NAME.last}`);
  });
});

// For tests that read back their own user's data: sign the page in as workerUser, not the run user.
test.describe('signed in as workerUser', () => {
  test('positive: the page is signed in as the worker user', { tag: '@example' }, async ({ page, workerUser }) => {
    await signInAs(page.context(), workerUser);
    await page.goto('/account/profile');

    await expect(page.getByTestId('nav-menu')).toHaveText(`${TEST_USER_NAME.first} ${TEST_USER_NAME.last}`);
    await expect(page.getByTestId('email')).toHaveValue(workerUser.email);
  });
});
