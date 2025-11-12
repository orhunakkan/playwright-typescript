// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Add Item to Local Storage', async ({ page }) => {
    // Navigate to index first to set localStorage on the domain
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Add item "username=testuser" to local storage
    await page.evaluate(() => {
      localStorage.setItem('username', 'testuser');
    });

    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 3. Click "Display local storage" button
    await page.getByRole('button', { name: 'Display local storage' }).click();

    // 4. Verify added item is displayed
    await expect(page.getByText('{"username":"testuser"}')).toBeVisible();
  });
});
