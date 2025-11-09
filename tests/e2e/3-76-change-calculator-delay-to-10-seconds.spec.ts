// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Change Calculator Delay to 10 Seconds', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Change delay input to "10"
    await page.locator('#delay').fill('10');

    // 3. Click button "5"
    await page.getByText('5', { exact: true }).click();

    // 4. Click button "+"
    await page.getByText('+').click();

    // 5. Click button "5" again
    await page.getByText('5', { exact: true }).click();

    // 6. Click button "="
    await page.getByText('=').click();

    // 7. Wait for result "10" to appear (10 second delay + buffer)
    await page.getByText("10").first().waitFor({ state: 'visible', timeout: 15000 });

    // 8. Verify result "10" is visible
    await expect(page.getByText('10')).toBeVisible();
  });
});
