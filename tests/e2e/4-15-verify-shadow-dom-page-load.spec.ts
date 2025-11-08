// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Verify Shadow DOM Page Load', async ({ page }) => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // 2. Wait for page to load completely and verify URL, title, heading
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    await expect(page.getByRole('heading', { name: 'Shadow DOM' })).toBeVisible();

    // 3. Verify "Hello Shadow DOM" text is displayed on the page
    await expect(page.getByText('Hello Shadow DOM')).toBeVisible();

    // Verify header with site title and GitHub link is visible
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })).toBeVisible();
  });
});
