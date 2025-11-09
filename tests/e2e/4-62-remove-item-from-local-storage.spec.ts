// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Remove Item from Local Storage', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Add item "username=testuser" to local storage
    await page.evaluate(() => { localStorage.setItem('username', 'testuser'); });

    // 3. Click "Display local storage" button and verify item exists
    await page.getByRole('button', { name: 'Display local storage' }).click();
    await expect(page.getByText('{"username":"testuser"}')).toBeVisible();

    // 4. Remove item "username" from local storage
    await page.evaluate(() => { localStorage.removeItem('username'); });

    // 5. Click "Display local storage" button again
    await page.getByRole('button', { name: 'Display local storage' }).click();

    // 6. Verify item has been removed (shows {})
    await expect(page.getByText('{}')).toBeVisible();
  });
});
