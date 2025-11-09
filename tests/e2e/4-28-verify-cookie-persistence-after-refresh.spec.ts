// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Verify Cookie Persistence After Refresh', async ({ page }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Display cookies to verify presence
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // Verify initial cookies are present
    await expect(page.getByText('username=John Doe')).toBeVisible();
    await expect(page.getByText('date=10/07/2018')).toBeVisible();

    // 3. Refresh the page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 4. Display cookies again
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // 5. Verify cookies persist after refresh
    await expect(page.getByText('username=John Doe')).toBeVisible();
    await expect(page.getByText('date=10/07/2018')).toBeVisible();
  });
});
