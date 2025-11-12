// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Mouse Over Testing', () => {
  test('Move Mouse Away from Image', async ({ page }) => {
    // 1. Navigate to mouse-over.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/mouse-over.html');

    // 2. Hover over first image to display caption
    await page.getByRole('img').nth(1).hover();

    // Verify caption appears
    await expect(page.getByText('Compass')).toBeVisible();

    // 3. Move mouse cursor away from the image to empty space (hover over heading)
    await page.getByRole('heading', { name: 'Mouse over' }).hover();

    // Verify caption disappears (implementation specific - caption should not be visible)
    await expect(page.getByText('Compass')).toBeHidden();
  });
});
