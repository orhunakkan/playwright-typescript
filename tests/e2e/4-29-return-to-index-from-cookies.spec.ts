// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Return to Index from Cookies Page', async ({ page, context }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // Verify we're on the cookies page
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');
    await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();

    // Verify cookies exist before navigation
    const cookiesBeforeNav = await context.cookies();
    expect(cookiesBeforeNav.length).toBeGreaterThan(0);

    // 2. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Verify successfully returned to index page
    await expect(page).toHaveURL(/.*index\.html/);
    await expect(page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cookies' })).toBeVisible();

    // Verify cookies remain in browser (domain-specific)
    const cookiesAfterNav = await context.cookies();
    expect(cookiesAfterNav.length).toBe(cookiesBeforeNav.length);
  });
});
