import { test as setup, expect } from '../../fixtures/index.ts';
import { AUTH_FILE, TEST_USER_NAME, registerUser } from '../../utilities/users.ts';

// Registers this run's user via the API, then signs in through the UI so a broken login fails here
// first, and saves the session for tests that opt in with test.use({ storageState: AUTH_FILE }).
setup('register and sign in the run user', async ({ page, api }) => {
  const user = await registerUser(api, 'run');

  await page.goto('/auth/login');
  await page.getByTestId('email').fill(user.email);
  await page.getByTestId('password').fill(user.password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('nav-menu')).toHaveText(`${TEST_USER_NAME.first} ${TEST_USER_NAME.last}`);

  await page.context().storageState({ path: AUTH_FILE });
});
