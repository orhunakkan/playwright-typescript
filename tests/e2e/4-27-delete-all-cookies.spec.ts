// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Delete All Cookies', async ({ page, context }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Display initial cookies
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // Verify initial cookies are present
    await expect(page.getByText('username=John Doe')).toBeVisible();
    await expect(page.getByText('date=10/07/2018')).toBeVisible();

    // 3. Use browser API to delete all cookies
    await context.clearCookies();

    // 4. Click "Display cookies" button
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // 5. Verify no cookies displayed
    await expect(page.getByText('username=John Doe')).not.toBeVisible();
    await expect(page.getByText('date=10/07/2018')).not.toBeVisible();

    // Verify via API that all cookies are deleted
    const cookies = await context.cookies();
    expect(cookies.length).toBe(0);

    // Verify page continues to function normally
    await expect(page.getByRole('button', { name: 'Display cookies' })).toBeEnabled();
  });
});
