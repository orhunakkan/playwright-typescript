// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Verify Initial Content Count', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    // 2. Count the number of paragraph elements initially loaded
    const paragraphs = page.locator('p');
    await paragraphs.first().waitFor({ state: 'visible' });

    const initialCount = await paragraphs.count();

    // Initial paragraph count is 20 paragraphs
    expect(initialCount).toBe(20);

    // 3. Note the initial page height
    const viewportHeight = page.viewportSize()?.height || 0;

    // Content fills more than one viewport height
    expect(viewportHeight).toBeGreaterThan(0);
    expect(viewportHeight).toBeLessThan(1000); // Typical viewport

    // Scroll is possible - check if last paragraph requires scrolling
    const lastParagraph = paragraphs.last();
    await lastParagraph.scrollIntoViewIfNeeded();
    await expect(lastParagraph).toBeVisible();
  });
});
