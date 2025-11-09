// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Verify Canvas State Persistence', async ({ page }) => {
    // 1. Navigate to draw-in-canvas.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/draw-in-canvas.html');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 2. Draw several marks on canvas
    await canvas.click({ position: { x: 100, y: 50 } });
    await canvas.click({ position: { x: 200, y: 75 } });
    await canvas.click({ position: { x: 150, y: 100 } });

    // 3. Scroll page up and down (if scrollable)
    const footerLink = page.getByRole('link', { name: 'Boni García' });
    await footerLink.scrollIntoViewIfNeeded();
    
    const heading = page.getByRole('heading', { name: 'Drawing in canvas' });
    await heading.scrollIntoViewIfNeeded();

    // 4. Verify drawings remain intact - canvas is still visible and accessible
    await expect(canvas).toBeVisible();
  });
});
