// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Return to Index from Navigation Page', async ({ page }) => {
    // Open page 2
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation2.html');

    // Click "Back to index"
    await page.getByRole('link', { name: 'Back to index' }).click();

    // Verify index loaded
    await expect(page).toHaveURL(/index\.html$/);
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })).toBeVisible();

    // Verify Chapter 3 section is visible
    await expect(page.getByRole('heading', { name: 'Chapter 3. WebDriver Fundamentals' })).toBeVisible();
  });
});
