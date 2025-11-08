// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Verify Page Height Exceeds Viewport', async ({ page }) => {
    // 1. Navigate to long page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // 2. Wait for page content to fully load by checking for last paragraph
    await page.locator('p').last().waitFor({ state: 'visible' });

    // 3. Get document body scroll height
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

    // 4. Get viewport height
    const viewportSize = page.viewportSize();
    const viewportHeight = viewportSize?.height || 0;

    // 5. Compare the values - Document scroll height is approximately 3837px
    expect(scrollHeight).toBeGreaterThan(3800);
    expect(scrollHeight).toBeLessThan(3900);

    // Viewport height is less than scroll height (approximately 720px)
    expect(viewportHeight).toBeLessThan(scrollHeight);
    expect(viewportHeight).toBeGreaterThan(600);
    expect(viewportHeight).toBeLessThan(800);

    // Content extends beyond initial viewport
    expect(scrollHeight).toBeGreaterThan(viewportHeight);
  });
});
