// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Verify Images Are Properly Sized', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 2. Wait for images to load completely (Done! message)
    await page.getByText('Done!').first().waitFor({ state: 'visible' });

    // 3. Verify each image has proper dimensions
    const dimensions = await page.getByRole('img', { name: 'compass' }).evaluate(() => {
      const images = document.querySelectorAll('img[alt="compass"], img[alt="calendar"], img[alt="award"], img[alt="landscape"]');
      return Array.from(images).map(img => ({
        alt: img.alt,
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
    });

    // Verify all images have consistent dimensions (256x256)
    dimensions.forEach(dim => {
      expect(dim.width).toBe(256);
      expect(dim.height).toBe(256);
      expect(dim.naturalWidth).toBe(256);
      expect(dim.naturalHeight).toBe(256);
    });

    // 4. Verify images are visible with proper sizing
    await expect(page.getByRole('img', { name: 'compass' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'calendar' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'award' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'landscape' })).toBeVisible();
  });
});
