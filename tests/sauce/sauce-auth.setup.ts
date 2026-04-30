import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { SauceLoginPage } from '../../pages/sauce-login.page';

const authFile = path.resolve('.auth/sauce-user.json');

setup('authenticate as standard_user', async ({ page }) => {
  const sauceLoginPage = new SauceLoginPage(page);
  await sauceLoginPage.actions.goto();
  await sauceLoginPage.actions.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: authFile });
});
