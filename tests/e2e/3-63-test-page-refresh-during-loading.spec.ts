// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Test Page Refresh During Loading', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 3. Refresh the page by navigating to it again
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/loading-images.html');

    // 4. Wait for "Done!" text to appear after refresh
    await page.getByText('Done!').first().waitFor({ state: 'visible' });

    // Verify "Done!" text is visible
    await expect(page.getByText('Done!')).toBeVisible();

    // Verify all 4 images are visible - compass
    await expect(page.getByRole('img', { name: 'compass' })).toBeVisible();

    // Verify all 4 images are visible - calendar
    await expect(page.getByRole('img', { name: 'calendar' })).toBeVisible();

    // Verify all 4 images are visible - award
    await expect(page.getByRole('img', { name: 'award' })).toBeVisible();

    // Verify all 4 images are visible - landscape
    await expect(page.getByRole('img', { name: 'landscape' })).toBeVisible();
  });
});
