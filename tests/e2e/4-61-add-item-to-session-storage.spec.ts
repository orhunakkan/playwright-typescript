// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Add Item to Session Storage', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Add item "email=test@example.com" to session storage
    await page.evaluate(() => { sessionStorage.setItem('email', 'test@example.com'); });

    // 3. Click "Display session storage" button
    await page.getByRole('button', { name: 'Display session storage' }).click();

    // 4. Verify both pre-populated and added items are displayed
    await expect(page.getByText('{"lastname":"Doe","name":"John","email":"test@example.com"}')).toBeVisible();
  });
});
