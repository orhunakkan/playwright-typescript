// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Mouse Over Testing', () => {
  test('Hover Over Third Image', async ({ page }) => {
    // 1. Navigate to mouse-over.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/mouse-over.html');

    // 2. Move mouse cursor over the third image
    await page.getByRole('img').nth(3).hover();

    // 3. Verify caption "Award" appears
    await expect(page.getByText('Award')).toBeVisible();
  });
});
