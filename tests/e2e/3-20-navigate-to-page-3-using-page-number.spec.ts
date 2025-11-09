// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Navigate to Page 3 Using Page Number', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation1.html');

    // Click page number 3
    await page.getByRole('link', { name: '3' }).click();

    // Verify navigation to navigation3.html
    await expect(page).toHaveURL(/navigation3\.html$/);

    // Verify page 3 paragraph content is visible (partial match)
    await expect(page.getByText('Excepteur sint occaecat')).toBeVisible();

    // Verify Page 3 link exists
    await expect(page.getByRole('link', { name: '3' })).toBeVisible();
  });
});
