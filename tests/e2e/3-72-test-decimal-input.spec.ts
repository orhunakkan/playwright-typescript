// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Test Decimal Input (3.5 + 2.5 = 6)', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Click "3"
    await page.getByText('3', { exact: true }).click();

    // Click "."
    await page.getByText('.', { exact: true }).click();

    // Click "5"
    await page.getByText('5', { exact: true }).click();

    // Click "+"
    await page.getByText('+', { exact: true }).click();

    // Click "2"
    await page.getByText('2', { exact: true }).click();

    // Click "." again
    await page.getByText('.', { exact: true }).click();

    // Click "5" again
    await page.getByText('5', { exact: true }).click();

    // Click "="
    await page.getByText('=', { exact: true }).click();

    // 4. Wait for result to appear in the display (5 seconds delay + 1 second buffer)
    await page.locator('.screen').getByText('6').waitFor({ state: 'visible', timeout: 7000 });

    // Verify display shows result "6"
    await expect(page.locator('.screen')).toContainText('6');
  });
});
