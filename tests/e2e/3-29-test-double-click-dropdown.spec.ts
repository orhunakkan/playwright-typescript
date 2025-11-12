// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Double-Click Dropdown', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 2. Double-click on "Use double-click here" button
    await page.getByRole('button', { name: 'Use double-click here' }).dblclick();

    // 4. Verify menu item "Action" is visible
    await expect(page.getByRole('link', { name: 'Action', exact: true })).toBeVisible();

    // Verify menu item "Another action" is visible
    await expect(page.getByRole('link', { name: 'Another action' })).toBeVisible();

    // Verify menu item "Something else here" is visible
    await expect(page.getByRole('link', { name: 'Something else here' })).toBeVisible();

    // Verify menu item "Separated link" is visible
    await expect(page.getByRole('link', { name: 'Separated link' })).toBeVisible();
  });
});
