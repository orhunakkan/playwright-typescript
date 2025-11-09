// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Verify Cookies in Browser', async ({ page, context }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Use browser automation API to get all cookies
    const cookies = await context.cookies();

    // 3. Verify presence of expected cookies
    const usernameCookie = cookies.find(cookie => cookie.name === 'username');
    const dateCookie = cookies.find(cookie => cookie.name === 'date');

    // Verify cookie named "username" exists with value "John Doe"
    expect(usernameCookie).toBeDefined();
    expect(usernameCookie?.value).toBe('John Doe');

    // Verify cookie named "date" exists with value "10/07/2018"
    expect(dateCookie).toBeDefined();
    expect(dateCookie?.value).toBe('10/07/2018');

    // Verify cookie properties (domain, path) are correctly set
    expect(usernameCookie?.domain).toContain('bonigarcia.dev');
    expect(usernameCookie?.path).toBe('/');
    expect(dateCookie?.domain).toContain('bonigarcia.dev');
    expect(dateCookie?.path).toBe('/');
  });
});
