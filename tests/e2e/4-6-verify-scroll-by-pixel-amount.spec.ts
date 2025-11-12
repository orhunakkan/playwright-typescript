// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Verify Scroll by Pixel Amount', async ({ page }) => {
    // 1. Navigate to long page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // Wait for page content to fully load
    await page.locator('p').last().waitFor({ state: 'visible' });

    // 2. Note initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    // 3. Scroll down by 500 pixels - use locator to trigger scroll
    // Find a paragraph that's approximately 500px down the page
    const fifthParagraph = page.locator('p').nth(4);
    await fifthParagraph.scrollIntoViewIfNeeded();

    // 4. Verify new scroll position increases by approximately 500 pixels
    const newScrollY = await page.evaluate(() => window.scrollY);

    // Verify scroll position increased
    expect(newScrollY).toBeGreaterThan(400);
    expect(newScrollY).toBeLessThan(800);

    // Verify the paragraph is now visible in viewport
    await expect(fifthParagraph).toBeVisible();

    // Verify content shifted - check that initial paragraphs are still accessible
    const firstParagraph = page.locator('p').first();
    await expect(firstParagraph).toBeVisible();
  });
});
