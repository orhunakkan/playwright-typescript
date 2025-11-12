// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Rapid Clicking on Canvas', async ({ page }) => {
    // 1. Navigate to draw-in-canvas.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/draw-in-canvas.html');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 2. Rapidly click on canvas multiple times in quick succession
    await canvas.click({ position: { x: 100, y: 50 }, clickCount: 1 });
    await canvas.click({ position: { x: 110, y: 55 }, clickCount: 1 });
    await canvas.click({ position: { x: 120, y: 60 }, clickCount: 1 });
    await canvas.click({ position: { x: 130, y: 65 }, clickCount: 1 });
    await canvas.click({ position: { x: 140, y: 70 }, clickCount: 1 });

    // 3. Observe drawing behavior - verify canvas remains stable and visible
    await expect(canvas).toBeVisible();
  });
});
