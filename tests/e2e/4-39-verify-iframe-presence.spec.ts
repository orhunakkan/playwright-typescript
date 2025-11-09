// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Verify IFrame Presence', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Locate iframe element on the page
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();

    // 3. Verify iframe properties (src, dimensions, etc.)
    await expect(iframe).toHaveAttribute('src', /content\.html/);
    await expect(iframe).toHaveAttribute('width', '100%');
    await expect(iframe).toHaveAttribute('height', '400');
  });
});
