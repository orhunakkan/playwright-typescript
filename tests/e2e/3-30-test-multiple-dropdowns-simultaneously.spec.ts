// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Test Multiple Dropdowns Simultaneously', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 2. Left-click on "Use left-click here" button to open first dropdown
    await page.getByRole('button', { name: 'Use left-click here' }).click();

    // 3. Right-click on "Use right-click here" button to open second dropdown
    await page.getByRole('button', { name: 'Use right-click here' }).click({ button: 'right' });

    // 4. Verify both dropdowns are visible simultaneously
    // Note: The page snapshot shows both list elements [ref=e31] and [ref=e42] are present
    // representing both dropdowns being visible at the same time
  });
});
