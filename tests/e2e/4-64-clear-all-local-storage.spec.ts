// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Clear All Local Storage', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Add multiple items to local storage (username, email, role)
    await page.evaluate(() => { 
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('email', 'test@example.com');
      localStorage.setItem('role', 'admin');
    });

    // 3. Click "Display local storage" button and verify all items
    await page.getByRole('button', { name: 'Display local storage' }).click();
    await expect(page.getByText('{"role":"admin","username":"testuser","email":"test@example.com"}')).toBeVisible();

    // 4. Clear all local storage
    await page.evaluate(() => { localStorage.clear(); });

    // 5. Click "Display local storage" button again
    await page.getByRole('button', { name: 'Display local storage' }).click();

    // 6. Verify storage is empty {}
    await expect(page.getByText('{}')).toBeVisible();
  });
});
