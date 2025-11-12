// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Chaining Operations', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Set delay to 1 second
    await page.locator('#delay').fill('1');

    // 3. Click button "5"
    await page.locator('.btn').getByText('5', { exact: true }).click();

    // 4. Click button "+"
    await page.locator('.btn').getByText('+', { exact: true }).click();

    // 5. Click button "3"
    await page.locator('.btn').getByText('3', { exact: true }).click();

    // 6. Click button "="
    await page.locator('.btn').getByText('=', { exact: true }).click();

    // 7. Wait for first result "8" to appear in the display (1 second delay + 1 second buffer)
    await page.locator('.screen').getByText('8').waitFor({ state: 'visible', timeout: 3000 });

    // 8. Click button "+" for second operation
    await page.locator('.btn').getByText('+', { exact: true }).click();

    // 9. Click button "2"
    await page.locator('.btn').getByText('2', { exact: true }).click();

    // 10. Click button "=" for second calculation
    await page.locator('.btn').getByText('=', { exact: true }).click();

    // 11. Wait for final result "10" to appear (1 second delay + 1 second buffer)
    await page.locator('.screen').getByText('10').waitFor({ state: 'visible', timeout: 3000 });

    // 12. Verify display shows final result "10" (chaining supported)
    await expect(page.locator('.screen')).toContainText('10');
  });
});
