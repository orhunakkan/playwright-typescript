// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Scroll to Specific Element', async ({ page }) => {
    // 1. Navigate to long page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // Wait for page content to fully load
    await page.locator('p').last().waitFor({ state: 'visible' });

    // 2. Identify a paragraph element in the middle of the page (10th paragraph)
    const targetParagraph = page.locator('p').nth(9);

    // Get scroll height for comparison
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

    // 3. Scroll the element into view using scrollIntoView()
    await targetParagraph.scrollIntoViewIfNeeded();

    // 4. Verify element is in viewport - Target element is visible after scrolling
    await expect(targetParagraph).toBeVisible();

    // Scroll position is between 0 and maximum scroll height
    const currentScrollY = await page.evaluate(() => window.scrollY);
    expect(currentScrollY).toBeGreaterThan(0);
    expect(currentScrollY).toBeLessThan(scrollHeight);

    // Page doesn't scroll to top or bottom - verify not at extremes
    expect(currentScrollY).toBeGreaterThan(500);
    expect(currentScrollY).toBeLessThan(scrollHeight - 500);
  });
});
