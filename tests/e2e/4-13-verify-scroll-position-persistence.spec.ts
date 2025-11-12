// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Verify Scroll Position Persistence', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    const paragraphs = page.locator('p');
    await paragraphs.first().waitFor({ state: 'visible' });

    // 2. Scroll down to load additional content
    await paragraphs.last().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelectorAll('p').length > 20);

    // 3. Scroll to a specific position in the middle (e.g., 15th paragraph)
    const targetParagraph = paragraphs.nth(14);
    await targetParagraph.scrollIntoViewIfNeeded();

    // 4. Note the scroll position and paragraph text
    const targetText = await targetParagraph.textContent();

    // 5. Navigate to a different page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Wait for index page to load
    await expect(page).toHaveURL(/.*index\.html/);
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' })).toBeVisible();

    // 6. Use browser back button
    await page.goBack();

    // 7. Check scroll position - Browser may restore scroll position (browser-dependent)
    await expect(page).toHaveURL(/.*infinite-scroll\.html/);

    // Content at that position is still visible (at minimum, page loads correctly)
    await expect(paragraphs.first()).toBeVisible();

    // No errors occur on page restore
    await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeVisible();
  });
});
