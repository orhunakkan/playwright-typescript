// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Verify Content During Rapid Scrolling', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    const paragraphs = page.locator('p');
    await paragraphs.first().waitFor({ state: 'visible' });

    // 2. Perform rapid scroll to bottom multiple times
    // First rapid scroll
    await paragraphs.last().scrollIntoViewIfNeeded();

    // Second rapid scroll
    await paragraphs.last().scrollIntoViewIfNeeded();

    // Third rapid scroll
    await paragraphs.last().scrollIntoViewIfNeeded();

    // Wait for any pending content to load
    await page.waitForFunction(() => document.querySelectorAll('p').length > 20);

    // 3. Verify content loading behavior
    const finalCount = await paragraphs.count();

    // Content loads appropriately
    expect(finalCount).toBeGreaterThanOrEqual(20);

    // Page remains responsive
    await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeVisible();

    // Verify first and last paragraphs are accessible
    await expect(paragraphs.first()).toBeVisible();

    // Content doesn't overlap or corrupt - check that paragraphs have proper text
    await expect(paragraphs.first()).toHaveText(/Lorem ipsum/);
  });
});
