// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Delete Specific Cookie', async ({ page, context }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Display initial cookies
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // Verify initial cookies are present
    await expect(page.getByText('username=John Doe')).toBeVisible();
    await expect(page.getByText('date=10/07/2018')).toBeVisible();

    // 3. Use browser API to delete "username" cookie
    const cookies = await context.cookies();
    const usernameCookie = cookies.find(cookie => cookie.name === 'username');
    expect(usernameCookie).toBeTruthy();
    await page.evaluate(() => {
      document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    // 4. Click "Display cookies" button again
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // 5. Verify cookie is removed
    // "username" cookie should not be visible
    await expect(page.getByText('username=John Doe')).toBeHidden();

    // "date" cookie should still be present
    await expect(page.getByText('date=10/07/2018')).toBeVisible();

    // Verify via API that username cookie is deleted
    const updatedCookies = await context.cookies();
    const deletedCookie = updatedCookies.find(cookie => cookie.name === 'username');
    expect(deletedCookie).toBeUndefined();
  });
});
