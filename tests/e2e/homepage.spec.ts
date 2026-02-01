import { expect, test } from '@playwright/test';
import HomePage from '../../pages/homepage';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('should display the correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
  });

  test('should display all chapter cards', async ({ page }) => {
    const homePage = new HomePage(page);
    await expect(homePage.chapter3Card).toBeVisible();
    await expect(homePage.chapter4Card).toBeVisible();
    await expect(homePage.chapter5Card).toBeVisible();
    await expect(homePage.chapter7Card).toBeVisible();
    await expect(homePage.chapter8Card).toBeVisible();
    await expect(homePage.chapter9Card).toBeVisible();
  });
});
