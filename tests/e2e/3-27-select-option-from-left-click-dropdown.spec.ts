// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Select Option from Left-Click Dropdown', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 2. Left-click on "Use left-click here" button
    await page.getByRole('button', { name: 'Use left-click here' }).click();

    // 3. Click on "Another action" menu item
    await page.getByRole('link', { name: 'Another action' }).click();
  });
});
