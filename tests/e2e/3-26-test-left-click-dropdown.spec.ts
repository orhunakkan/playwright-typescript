// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Left-Click Dropdown', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 3. Perform left-click on "Use left-click here" button
    await page.getByRole('button', { name: 'Use left-click here' }).click();

    // 4. Verify dropdown menu item "Action" appears
    await expect(page.getByRole('link', { name: 'Action', exact: true })).toBeVisible();

    // Verify dropdown menu item "Another action" appears
    await expect(page.getByRole('link', { name: 'Another action' })).toBeVisible();

    // Verify dropdown menu item "Something else here" appears
    await expect(page.getByRole('link', { name: 'Something else here' })).toBeVisible();

    // Verify dropdown menu item "Separated link" appears
    await expect(page.getByRole('link', { name: 'Separated link' })).toBeVisible();
  });
});
