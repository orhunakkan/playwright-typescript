// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Test Explicit Wait for Loading Completion', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 2. Implement explicit wait for "Done!" text to appear
    await page.getByText("Done!").first().waitFor({ state: 'visible' });

    // 3. Verify explicit wait succeeded
    await expect(page.getByText('Done!')).toBeVisible();

    // 4. Verify images loaded after explicit wait
    await expect(page.getByRole('img', { name: 'compass' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'calendar' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'award' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'landscape' })).toBeVisible();
  });
});
