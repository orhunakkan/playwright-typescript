// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Trigger Multiple Scroll Events', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    // 2. Record initial paragraph count
    const paragraphs = page.locator('p');
    await paragraphs.first().waitFor({ state: 'visible' });

    const initialCount = await paragraphs.count();

    // 3. Scroll to bottom
    await paragraphs.last().scrollIntoViewIfNeeded();

    // 4. Wait for content to load
    await page.waitForFunction(() => document.querySelectorAll('p').length > 20);

    const firstLoadCount = await paragraphs.count();
    expect(firstLoadCount).toBeGreaterThan(initialCount);

    // 5. Scroll to new bottom
    await paragraphs.last().scrollIntoViewIfNeeded();

    // 6. Wait for additional content to load
    await page.waitForFunction(prevCount => document.querySelectorAll('p').length > prevCount, firstLoadCount);

    // 7. Verify content continues to increase
    const secondLoadCount = await paragraphs.count();

    // Content loads after each scroll to bottom event
    expect(secondLoadCount).toBeGreaterThan(firstLoadCount);

    // Page continues to extend vertically
    expect(secondLoadCount).toBeGreaterThan(initialCount + 30);

    // Performance remains stable - page is still responsive
    await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeVisible();
  });
});
