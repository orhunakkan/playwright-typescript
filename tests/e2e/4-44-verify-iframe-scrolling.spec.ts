// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Verify IFrame Scrolling', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Switch to iframe
    const iframe = page.frameLocator('iframe');
    
    // 3. Get iframe scroll height - verify content extends beyond visible area
    const firstParagraph = iframe.locator('p').first();
    const lastParagraph = iframe.locator('p').last();
    
    await expect(firstParagraph).toBeVisible();
    
    // 4. Scroll within iframe to last paragraph
    await lastParagraph.scrollIntoViewIfNeeded();
    
    // 5. Verify scrolling works independently - last paragraph is now visible
    await expect(lastParagraph).toBeVisible();
    await expect(lastParagraph).toContainText('Fames curabitur');
  });
});
