// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Verify Long Page Load', async ({ page }) => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/long-page.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // 2. Wait for page to load completely - verify page URL
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // Verify page title
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // Verify main heading "This is a long page" is visible
    await expect(page.getByRole('heading', { name: 'This is a long page' })).toBeVisible();

    // Verify header with site title is visible
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })).toBeVisible();

    // Verify header with GitHub link is visible
    await expect(page.getByRole('heading', { name: 'Practice site' })).toBeVisible();
  });
});
