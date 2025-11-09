// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Verify Loading Images Page Initial State', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Loading images" link in Chapter 3 section
    await page.getByRole('link', { name: 'Loading images' }).click();

    // Verify "Loading images" heading is visible
    await expect(page.getByRole('heading', { name: 'Loading images' })).toBeVisible();

    // Verify that the loading has completed and 'Done!' text is displayed
    await expect(page.getByText('Done!')).toBeVisible({ timeout: 10000 });

    // Verify compass image is visible after loading
    await expect(page.getByRole('img', { name: 'compass' })).toBeVisible();

    // Verify calendar image is visible after loading
    await expect(page.getByRole('img', { name: 'calendar' })).toBeVisible();

    // Verify award image is visible after loading
    await expect(page.getByRole('img', { name: 'award' })).toBeVisible();

    // Verify landscape image is visible after loading
    await expect(page.getByRole('img', { name: 'landscape' })).toBeVisible();
  });
});
