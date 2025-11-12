// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Loading Images Testing', () => {
  test('Verify Loading Timeout Duration', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Loading images" link
    await page.getByRole('link', { name: 'Loading images' }).click();

    // 3. Record start time before page loads
    const startTime = Date.now();

    // 4. Wait for "Done!" text to appear
    await page.getByText('Done!').first().waitFor({ state: 'visible' });

    // 5. Record end time after loading completes
    const endTime = Date.now();

    // Verify "Done!" text is visible to confirm loading completed
    await expect(page.getByText('Done!')).toBeVisible();

    // 6. Calculate and verify duration is within expected range (should be less than 10 seconds)
    const duration = (endTime - startTime) / 1000;
    expect(duration).toBeLessThan(10);
  });
});
