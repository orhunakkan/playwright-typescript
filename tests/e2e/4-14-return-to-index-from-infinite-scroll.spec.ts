// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Return to Index from Infinite Scroll Page', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    // Verify we're on the infinite scroll page
    await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeVisible();

    // 2. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Successfully returns to index page
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // No content from infinite scroll persists
    await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeHidden();

    // Index page loads normally
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Infinite scroll' })).toBeVisible();
  });
});
