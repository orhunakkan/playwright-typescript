// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Long Page - Scrolling Tests', () => {
  test('Scroll to Bottom of Page', async ({ page }) => {
    // 1. Navigate to long page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/long-page.html');

    // Wait for page content to fully load
    await page.locator('p').last().waitFor({ state: 'visible' });

    // 2. Verify initial scroll position is at top (scrollY = 0)
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    // 3. Scroll to bottom by scrolling the footer into view
    const footer = page.getByText('Copyright © 2021-2025');
    await footer.scrollIntoViewIfNeeded();

    // 4. Verify scroll position changed - After scrolling, scroll position is significantly greater than initial
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(2900); // More flexible threshold to account for viewport variations

    // Footer "Copyright © 2021-2025" is visible
    await expect(page.getByText('Copyright © 2021-2025')).toBeVisible();

    // Boni García link is visible in footer
    await expect(page.getByRole('link', { name: 'Boni García' })).toBeVisible();
  });
});
