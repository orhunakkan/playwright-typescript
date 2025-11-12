// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Verify Page Content Changes', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation1.html');

    const contentParagraph = page.locator('main p');
    await expect(contentParagraph).toHaveText(/Lorem ipsum dolor sit amet/);

    // Go to page 2
    await page.getByRole('link', { name: '2' }).click();
    await expect(page).toHaveURL(/navigation2\.html$/);
    await expect(contentParagraph).toHaveText(/Ut enim ad minim veniam/);

    // Go to page 3
    await page.getByRole('link', { name: '3' }).click();
    await expect(page).toHaveURL(/navigation3\.html$/);
    await expect(contentParagraph).toHaveText(/Excepteur sint occaecat/);
  });
});
