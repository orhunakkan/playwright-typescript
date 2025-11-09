// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Test Large Number Calculation', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Click button "9" first time
    await page.locator('.btn').getByText('9', { exact: true }).click();

    // 3. Click button "9" second time
    await page.locator('.btn').getByText('9', { exact: true }).click();

    // 4. Click button "9" third time
    await page.locator('.btn').getByText('9', { exact: true }).click();

    // 5. Click button "+"
    await page.locator('.btn').getByText('+', { exact: true }).click();

    // 6. Click button "9" fourth time
    await page.locator('.btn').getByText('9', { exact: true }).click();

    // 7. Click button "9" fifth time
    await page.locator('.btn').getByText('9', { exact: true }).click();

    // 8. Click button "9" sixth time
    await page.locator('.btn').getByText('9', { exact: true }).click();

    // 9. Click button "="
    await page.locator('.btn').getByText('=', { exact: true }).click();

    // 10. Wait for result "1998" to appear in the display (5 seconds delay + 1 second buffer)
    await page.locator('.screen').getByText('1998').waitFor({ state: 'visible', timeout: 7000 });

    // 11. Verify display shows result "1998"
    await expect(page.locator('.screen')).toContainText('1998');
  });
});
