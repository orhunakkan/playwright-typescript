// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Draw in Canvas Testing', () => {
  test('Verify Draw in Canvas Page Load', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
    // 2. Click on "Draw in canvas" link in Chapter 3 section
    await page.getByRole('link', { name: 'Draw in canvas' }).click();

    // Verify "Drawing in canvas" heading is visible
    await expect(page.getByRole('heading', { name: 'Drawing in canvas' })).toBeVisible();

    // Verify text "Click to draw." is displayed
    await expect(page.getByText('Click to draw.')).toBeVisible();

    // Verify HTML5 canvas element is present and visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
