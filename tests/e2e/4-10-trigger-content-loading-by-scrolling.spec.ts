// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Trigger Content Loading by Scrolling', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    // 2. Count initial paragraphs
    const paragraphs = page.locator('p');
    await paragraphs.first().waitFor({ state: 'visible' });
    
    const initialCount = await paragraphs.count();
    expect(initialCount).toBe(20);

    // 3. Scroll to bottom of page
    const lastParagraph = paragraphs.last();
    await lastParagraph.scrollIntoViewIfNeeded();

    // 4. Wait for new content to load
    await page.waitForFunction(() => document.querySelectorAll('p').length > 20);

    // 5. Count paragraphs again
    const newCount = await paragraphs.count();

    // 6. Verify page height increased - New paragraphs are added
    expect(newCount).toBeGreaterThan(initialCount);
    
    // Paragraph count increases (adds approximately 20 more paragraphs)
    expect(newCount).toBeGreaterThanOrEqual(initialCount + 15);
    expect(newCount).toBeLessThanOrEqual(initialCount + 25);

    // No error messages appear
    await expect(page.getByText('Error')).not.toBeVisible();
  });
});
