// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Draw Single Click on Canvas', async ({ page }) => {
    // 1. Navigate to draw-in-canvas.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/draw-in-canvas.html');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 2. Click once at a specific position on the canvas
    await canvas.click({ position: { x: 100, y: 75 } });

    // 3. Observe result - verify canvas element is still visible and accessible
    await expect(canvas).toBeVisible();
  });
});
