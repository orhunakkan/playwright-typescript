// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookies - Browser Cookie Management', () => {
  test('Verify Cookies Page Load', async ({ page }) => {
    // 1. Navigate to cookies page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');

    // 2. Wait for page to load completely and verify page URL
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/cookies.html');
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // Verify main heading "Cookies" is visible
    await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();

    // Verify "Display cookies" button is present and enabled
    await expect(page.getByRole('button', { name: 'Display cookies' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Display cookies' })).toBeEnabled();
  });
});
