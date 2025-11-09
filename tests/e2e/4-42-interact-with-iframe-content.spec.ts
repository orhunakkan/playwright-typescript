// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Interact with IFrame Content', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Switch to iframe
    const iframe = page.frameLocator('iframe');
    
    // 3. Locate a specific paragraph element
    const fifthParagraph = iframe.locator('p').nth(4);
    
    // 4. Verify element properties and text
    await expect(fifthParagraph).toBeVisible();
    await expect(fifthParagraph).toContainText('Lobortis luctus');
  });
});
