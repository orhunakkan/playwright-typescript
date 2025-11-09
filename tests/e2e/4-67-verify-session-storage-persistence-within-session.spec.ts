// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Verify Session Storage Persistence Within Session', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Click "Display session storage" button and verify pre-populated data
    await page.getByRole('button', { name: 'Display session storage' }).click();
    await expect(page.getByText('{"lastname":"Doe","name":"John"}')).toBeVisible();

    // 3. Refresh the page (reload)
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 4. Click "Display session storage" button again
    await page.getByRole('button', { name: 'Display session storage' }).click();

    // 5. Verify pre-populated data still persists
    await expect(page.getByText('{"lastname":"Doe","name":"John"}')).toBeVisible();
  });
});
