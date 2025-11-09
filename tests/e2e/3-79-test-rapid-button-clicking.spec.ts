// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Test Rapid Button Clicking', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Rapidly click button "7" three times
    await page.locator('.btn').getByText('7', { exact: true }).click();

    // 3. Click button "7" second time
    await page.locator('.btn').getByText('7', { exact: true }).click();

    // 4. Click button "7" third time
    await page.locator('.btn').getByText('7', { exact: true }).click();

    // 5. Click button "+"
    await page.locator('.btn').getByText('+', { exact: true }).click();

    // 6. Click button "3" three times
    await page.locator('.btn').getByText('3', { exact: true }).click();

    // 7. Click button "3" second time
    await page.locator('.btn').getByText('3', { exact: true }).click();

    // 8. Click button "3" third time
    await page.locator('.btn').getByText('3', { exact: true }).click();

    // 9. Click button "="
    await page.locator('.btn').getByText('=', { exact: true }).click();

    // 10. Wait for result "1110" to appear in the display (5 seconds delay + 1 second buffer)
    await page.locator('.screen').getByText('1110').waitFor({ state: 'visible', timeout: 7000 });

    // 11. Verify display shows result "1110"
    await expect(page.locator('.screen')).toContainText('1110');
  });
});
