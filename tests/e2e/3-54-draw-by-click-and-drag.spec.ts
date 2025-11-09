// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Draw by Click and Drag', async ({ page }) => {
    // 1. Navigate to draw-in-canvas.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/draw-in-canvas.html');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 2. Click on canvas and hold mouse button
    // 3. Move mouse while holding button (drag)
    // 4. Release mouse button
    await canvas.hover({ position: { x: 50, y: 50 } });
    await page.mouse.down();
    await canvas.hover({ position: { x: 200, y: 100 } });
    await page.mouse.up();

    // Verify canvas is still visible and accessible
    await expect(canvas).toBeVisible();
  });
});
