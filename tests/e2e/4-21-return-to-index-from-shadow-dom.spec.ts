// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Return to Index from Shadow DOM Page', async ({ page }) => {
    // 1. Navigate to shadow DOM page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // Verify we're on the Shadow DOM page
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');
    await expect(page.getByRole('heading', { name: 'Shadow DOM' })).toBeVisible();

    // 2. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Verify successfully returned to index page
    await expect(page).toHaveURL(/.*index\.html/);
    await expect(page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' })).toBeVisible();

    // No shadow DOM content persists
    await expect(page.getByRole('link', { name: 'Shadow DOM' })).toBeVisible();

    // Index page loads normally
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })).toBeVisible();
  });
});
