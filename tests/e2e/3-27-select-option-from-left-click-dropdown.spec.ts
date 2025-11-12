// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Select Option from Left-Click Dropdown', async ({ page }) => {
    // 1. Navigate to dropdown-menu.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dropdown-menu.html');

    // 2. Click on "Use left-click here" button
    await page.getByRole('button', { name: 'Use left-click here' }).click();

    // 3. Select "Another action" from the dropdown
    const anotherAction = page.getByRole('link', { name: 'Another action' });
    await expect(anotherAction).toBeVisible();
    await anotherAction.click();

    // 4. Verify the dropdown is closed after selection
    await expect(anotherAction).toBeHidden();
  });
});
