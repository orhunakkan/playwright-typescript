// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Mouse Over Testing', () => {
  test('Rapidly Hover Across Multiple Images', async ({ page }) => {
    // 1. Navigate to mouse-over.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/mouse-over.html');

    // 2. Quickly move mouse across all four images from left to right - First image
    await page.getByRole('img').nth(1).hover();

    // 3. Observe caption changes - Verify Compass caption
    await expect(page.getByText('Compass')).toBeVisible();

    // 2. Quickly move mouse across all four images from left to right - Second image
    await page.getByRole('img').nth(2).hover();

    // 3. Observe caption changes - Verify Calendar caption
    await expect(page.getByText('Calendar')).toBeVisible();

    // 2. Quickly move mouse across all four images from left to right - Third image
    await page.getByRole('img').nth(3).hover();

    // 3. Observe caption changes - Verify Award caption
    await expect(page.getByText('Award')).toBeVisible();

    // 2. Quickly move mouse across all four images from left to right - Fourth image
    await page.getByRole('img').nth(4).hover();

    // 3. Observe caption changes - Verify Landscape caption
    await expect(page.getByText('Landscape')).toBeVisible();
  });
});
