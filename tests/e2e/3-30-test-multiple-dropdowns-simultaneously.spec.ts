// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Multiple Dropdowns Simultaneously', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 2. Left-click on "Use left-click here" button to open first dropdown
    await page.getByRole('button', { name: 'Use left-click here' }).click();

    // 3. Right-click on "Use right-click here" button to open second dropdown
    await page.getByRole('button', { name: 'Use right-click here' }).click({ button: 'right' });

    // 4. Verify both dropdowns are visible simultaneously
    const leftMenu = page.locator('#my-dropdown-1 ~ .dropdown-menu');
    const rightMenu = page.locator('#context-menu-2');
    await expect(leftMenu).toBeVisible();
    await expect(rightMenu).toBeVisible();
  });
});
