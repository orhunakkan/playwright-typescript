// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Draw by Clicking Multiple Times', async ({ page }) => {
    // 1. Navigate to draw-in-canvas.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/draw-in-canvas.html');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 2. Click at multiple different positions on the canvas
    await canvas.click({ position: { x: 50, y: 50 } });
    await canvas.click({ position: { x: 150, y: 75 } });
    await canvas.click({ position: { x: 250, y: 50 } });

    // 3. Observe accumulated drawing - verify canvas is still visible and accessible
    await expect(canvas).toBeVisible();
  });
});
