// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Clear All Session Storage', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Click "Display session storage" button to see pre-populated data
    await page.getByRole('button', { name: 'Display session storage' }).click();

    // 3. Verify pre-populated data is displayed
    await expect(page.getByText('{"lastname":"Doe","name":"John"}')).toBeVisible();

    // 4. Clear all session storage
    await page.evaluate(() => { sessionStorage.clear(); });

    // 5. Click "Display session storage" button again
    await page.getByRole('button', { name: 'Display session storage' }).click();

    // 6. Verify storage is empty {}
    await expect(page.getByText('{}')).toBeVisible();
  });
});
