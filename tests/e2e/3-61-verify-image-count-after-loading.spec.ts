// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Verify Image Count After Loading', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 3. Wait for "Done!" text to appear
    await page.getByText("Done!").first().waitFor({ state: 'visible' });

    // 4. Count the number of images on the page
    const images = page.locator('img[alt="compass"], img[alt="calendar"], img[alt="award"], img[alt="landscape"]');
    await expect(images).toHaveCount(4);
  });
});
