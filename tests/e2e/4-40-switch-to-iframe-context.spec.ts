// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Switch to IFrame Context', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Switch automation context to the iframe
    const iframe = page.frameLocator('iframe');

    // 3. Verify content is accessible within iframe
    const firstParagraph = iframe.locator('p').first();
    await expect(firstParagraph).toBeVisible();
    await expect(firstParagraph).toContainText('Lorem ipsum dolor sit amet');

    const paragraphs = iframe.locator('p');
    await expect(paragraphs).toHaveCount(20);
  });
});
