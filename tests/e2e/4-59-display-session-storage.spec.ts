// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage', () => {
  test('Display Session Storage', async ({ page }) => {
    // 1. Navigate to web storage page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Click "Display session storage" button
    await page.getByRole('button', { name: 'Display session storage' }).click();

    // 3. Verify session storage displays pre-populated data
    await expect(page.getByText('{"lastname":"Doe","name":"John"}')).toBeVisible();
  });
});
