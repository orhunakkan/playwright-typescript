// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Test Zero as Operand', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Click button "0"
    await page.getByText('0', { exact: true }).click();

    // 3. Click button "+"
    await page.getByText('+', { exact: true }).click();

    // 4. Click button "0" again
    await page.getByText('0', { exact: true }).click();

    // 5. Click button "="
    await page.getByText('=', { exact: true }).click();

    // 6. Wait for result "0" to appear in the display (5 seconds delay + buffer)
    await page.locator('.screen').getByText('0').waitFor({ state: 'visible', timeout: 8000 });

    // 7. Verify display shows result "0"
    await expect(page.locator('.screen')).toContainText('0');
  });
});
