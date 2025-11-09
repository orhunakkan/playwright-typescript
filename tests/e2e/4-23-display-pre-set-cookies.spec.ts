// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Display Pre-set Cookies', async ({ page }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Click "Display cookies" button
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // 3. Observe displayed cookie information
    // Verify cookie "username=John Doe" is displayed
    await expect(page.getByText('username=John Doe')).toBeVisible();

    // Verify cookie "date=10/07/2018" is displayed
    await expect(page.getByText('date=10/07/2018')).toBeVisible();
  });
});
