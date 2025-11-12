// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Verify Frames Page Load', async ({ page }) => {
    // 1. Navigate to frames.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // Verify page URL
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // Verify page title
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // 2. Verify frameset structure and count frames
    const frameInfo = await page.evaluate(() => {
      return {
        frameCount: window.frames.length,
        hasFrameset: document.querySelector('frameset') !== null,
      };
    });

    // Verify page uses HTML frameset structure
    expect(frameInfo.hasFrameset).toBe(true);

    // Verify multiple frames are present (exactly 3)
    expect(frameInfo.frameCount).toBe(3);
  });
});
