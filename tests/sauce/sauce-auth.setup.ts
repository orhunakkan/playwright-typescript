import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { config } from '../../config/env';

const authFile = path.resolve('.auth/sauce-user.json');

setup('authenticate as standard_user', async ({ page }) => {
  await page.goto(config.sauceDemoUrl);
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: authFile });
});
