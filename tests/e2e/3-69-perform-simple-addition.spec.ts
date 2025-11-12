// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Perform Simple Addition (2 + 3 = 5)', async ({ page }) => {
    // 1. Navigate to index.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Click "2" button
    await page.getByText('2', { exact: true }).click();

    // 4. Click "+" button
    await page.getByText('+', { exact: true }).click();

    // 5. Click "3" button
    await page.getByText('3', { exact: true }).click();

    // 6. Click "=" button
    await page.getByText('=', { exact: true }).click();

    // 7. Wait for result to appear in the display (5 seconds delay + buffer)
    await page.locator('.screen').getByText('5').waitFor({ state: 'visible', timeout: 10000 });

    // 8. Verify display shows "5"
    await expect(page.locator('.screen')).toContainText('5');
  });
});
