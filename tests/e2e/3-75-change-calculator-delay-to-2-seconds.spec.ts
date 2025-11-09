// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Change Calculator Delay to 2 Seconds', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Click in the delay input field
    await page.locator('#delay').click();

    // 3. Clear existing value and type "2"
    await page.locator('#delay').fill('2');

    // 4. Click button "1" for calculation
    await page.getByText('1', { exact: true }).click();

    // 5. Click button "+"
    await page.getByText('+', { exact: true }).click();

    // 6. Click button "1" again
    await page.getByText('1', { exact: true }).click();

    // 7. Click button "="
    await page.getByText('=', { exact: true }).click();

    // 8. Wait for result "2" to appear in the display (2 second delay + 1 second buffer)
    await page.locator('.screen').getByText('2').waitFor({ state: 'visible', timeout: 4000 });

    // 9. Verify display shows result "2"
    await expect(page.locator('.screen')).toContainText('2');
  });
});
