// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Scroll Up from Bottom', async ({ page }) => {
    // 1. Navigate to long page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // Wait for page content to fully load
    await page.locator('p').last().waitFor({ state: 'visible' });

    // 2. Scroll to bottom by scrolling the footer into view
    const footer = page.getByText('Copyright © 2021-2025');
    await footer.scrollIntoViewIfNeeded();

    // Verify we're at the bottom
    const bottomScrollY = await page.evaluate(() => window.scrollY);
    expect(bottomScrollY).toBeGreaterThan(3000);

    // 3. Scroll back to top by scrolling the main heading into view
    const mainHeading = page.getByRole('heading', { name: 'This is a long page' });
    await mainHeading.scrollIntoViewIfNeeded();

    // 4. Verify scroll position - After scrolling to top, scrollY position is 0
    const topScrollY = await page.evaluate(() => window.scrollY);
    expect(topScrollY).toBe(0);

    // First paragraph is visible
    const firstParagraph = page.locator('p').first();
    await expect(firstParagraph).toBeVisible();

    // Main heading "This is a long page" is visible in viewport
    await expect(page.getByRole('heading', { name: 'This is a long page' })).toBeVisible();

    // Header remains at top of page
    await expect(
      page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })
    ).toBeVisible();
  });
});
