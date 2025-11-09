// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Verify Session Storage Clears on New Session', async ({ page }) => {
    // Note: This test demonstrates sessionStorage behavior within same test run
    // True cross-session testing would require new browser context

    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Add custom item "testkey=testvalue" to sessionStorage
    await page.evaluate(() => { sessionStorage.setItem('testkey', 'testvalue'); });

    // 3. Click "Display session storage" button
    await page.getByRole('button', { name: 'Display session storage' }).click();

    // 4. Verify custom item appears along with pre-populated data
    await expect(page.getByText('{"testkey":"testvalue","lastname":"Doe","name":"John"}')).toBeVisible();
  });
});
