// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Mouse Over Testing', () => {
  test('Hover with Keyboard Navigation', async ({ page }) => {
    // 1. Navigate to mouse-over.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/mouse-over.html');

    // 2. Try to use Tab key to focus on images - First Tab
    await page.keyboard.press('Tab');

    // 2. Try to use Tab key to focus on images - Second Tab
    await page.keyboard.press('Tab');

    // 3. Verify if caption appears with keyboard focus
    // Images are not keyboard-focusable and captions don't appear with Tab navigation
    await expect(page.getByText('Compass')).toBeHidden();
    await expect(page.getByText('Calendar')).toBeHidden();
    await expect(page.getByText('Award')).toBeHidden();
    await expect(page.getByText('Landscape')).toBeHidden();

    // 4. Test accessibility compliance - Verify captions only appear on mouse hover
    await page.getByRole('img').nth(1).hover();

    // 4. Test accessibility compliance - Verify caption appears with mouse hover
    await expect(page.getByText('Compass')).toBeVisible();
  });
});
