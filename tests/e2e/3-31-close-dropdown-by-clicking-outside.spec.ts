// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Close Dropdown by Clicking Outside', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 2. Left-click on "Use left-click here" button to open dropdown
    await page.getByRole('button', { name: 'Use left-click here' }).click();

    // 3. Verify dropdown is visible
    await expect(page.getByRole('link', { name: 'Action', exact: true })).toBeVisible();

    // 4. Click on the page heading to click outside the dropdown
    await page.getByRole('heading', { name: 'Dropdown menu' }).click();

    // 5. Verify dropdown is no longer visible
    await expect(page.getByRole('link', { name: 'Action', exact: true })).not.toBeVisible();
  });
});
