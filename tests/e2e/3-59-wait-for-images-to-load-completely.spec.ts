// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Wait for Images to Load Completely', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 3. Wait explicitly for "Done!" text to appear (with timeout)
    await page.getByText('Done!').first().waitFor({ state: 'visible' });

    // Verify "Done!" text is visible
    await expect(page.getByText('Done!')).toBeVisible();

    // Verify compass image is visible
    await expect(page.getByRole('img', { name: 'compass' })).toBeVisible();

    // Verify calendar image is visible
    await expect(page.getByRole('img', { name: 'calendar' })).toBeVisible();

    // Verify award image is visible
    await expect(page.getByRole('img', { name: 'award' })).toBeVisible();

    // Verify landscape image is visible
    await expect(page.getByRole('img', { name: 'landscape' })).toBeVisible();
  });
});
