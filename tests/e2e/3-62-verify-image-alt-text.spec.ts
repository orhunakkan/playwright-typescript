// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Verify Image Alt Text', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 3. Wait for "Done!" text to appear
    await page.getByText("Done!").first().waitFor({ state: 'visible' });

    // 4. Verify compass image has correct alt text
    await expect(page.getByRole('img', { name: 'compass' })).toBeVisible();

    // Verify calendar image has correct alt text
    await expect(page.getByRole('img', { name: 'calendar' })).toBeVisible();

    // Verify award image has correct alt text
    await expect(page.getByRole('img', { name: 'award' })).toBeVisible();

    // Verify landscape image has correct alt text
    await expect(page.getByRole('img', { name: 'landscape' })).toBeVisible();
  });
});
