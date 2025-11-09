// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Test Drawing in Different Canvas Areas', async ({ page }) => {
    // 1. Navigate to draw-in-canvas.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/draw-in-canvas.html');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();

    // 2. Draw in top-left corner of canvas
    await canvas.click({ position: { x: 10, y: 10 } });

    // 3. Draw in top-right corner
    await canvas.click({ position: { x: boundingBox!.width - 10, y: 10 } });

    // 4. Draw in bottom-left corner
    await canvas.click({ position: { x: 10, y: boundingBox!.height - 10 } });

    // 5. Draw in bottom-right corner
    await canvas.click({ position: { x: boundingBox!.width - 10, y: boundingBox!.height - 10 } });

    // 6. Draw in center of canvas
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });

    // Verify canvas is still visible and accessible
    await expect(canvas).toBeVisible();
  });
});
