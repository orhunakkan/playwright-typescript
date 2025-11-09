// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Verify IFrame Content', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Switch to iframe
    const iframe = page.frameLocator('iframe');
    
    // 3. Count paragraph elements within iframe
    const paragraphs = iframe.locator('p');
    await expect(paragraphs).toHaveCount(20);
    
    // 4. Verify text content
    const firstParagraph = paragraphs.first();
    await expect(firstParagraph).toContainText('Lorem ipsum');
    await expect(firstParagraph).toBeVisible();
  });
});
