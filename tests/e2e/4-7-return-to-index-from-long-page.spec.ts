// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Return to Index from Long Page', async ({ page }) => {
    // 1. Navigate to long page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // Verify we are on the long page
    await expect(page.getByRole('heading', { name: 'This is a long page' })).toBeVisible();

    // 2. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 3. Verify navigation back to index - URL changes to index.html
    await expect(page).toHaveURL(/.*index\.html/);

    // Main index page with all chapters is displayed
    await expect(
      page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })
    ).toBeVisible();

    // Chapter 4 section is visible with all its links
    await expect(
      page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Long page' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Infinite scroll' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shadow DOM' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cookies' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Frames', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'IFrames' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dialog boxes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Web storage' })).toBeVisible();
  });
});
