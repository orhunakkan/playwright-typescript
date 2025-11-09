// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Add New Cookie', async ({ page, context }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Use browser API to add a new cookie
    await context.addCookies([
      {
        name: 'testcookie',
        value: 'testvalue',
        domain: 'bonigarcia.dev',
        path: '/',
      },
    ]);

    // 3. Click "Display cookies" button
    await page.getByRole('button', { name: 'Display cookies' }).click();

    // 4. Verify new cookie appears along with existing ones
    await expect(page.getByText('testcookie=testvalue')).toBeVisible();
    await expect(page.getByText('username=John Doe')).toBeVisible();
    await expect(page.getByText('date=10/07/2018')).toBeVisible();

    // Verify cookie persists in browser storage
    const cookies = await context.cookies();
    const testCookie = cookies.find(cookie => cookie.name === 'testcookie');
    expect(testCookie).toBeDefined();
    expect(testCookie?.value).toBe('testvalue');
  });
});
