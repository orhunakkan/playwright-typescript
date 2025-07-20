import { test, expect } from '@playwright/test';

test.describe('Heroku App - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page visual regression test', async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });
});
