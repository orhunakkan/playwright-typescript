// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Verify Storage Independence', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Add item "local_item=local_value" to localStorage
    await page.evaluate(() => {
      localStorage.setItem('local_item', 'local_value');
    });

    // 3. Add item "session_item=session_value" to sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('session_item', 'session_value');
    });

    // 4. Click "Display local storage" button and verify only localStorage item
    await page.getByRole('button', { name: 'Display local storage' }).click();
    await expect(page.getByText('{"local_item":"local_value"}')).toBeVisible();

    // 5. Click "Display session storage" button and verify sessionStorage items
    await page.getByRole('button', { name: 'Display session storage' }).click();
    await expect(page.getByText('{"session_item":"session_value","lastname":"Doe","name":"John"}')).toBeVisible();
  });
});
