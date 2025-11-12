// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Clear Function', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Click button "1"
    await page.getByText('1', { exact: true }).click();

    // Click button "+"
    await page.getByText('+', { exact: true }).click();

    // Click button "2"
    await page.getByText('2', { exact: true }).click();

    // 4. Click "C" (clear) button
    await page.getByText('C', { exact: true }).click();

    // 5. Verify display is cleared - screen should be empty
    await expect(page.locator('.screen')).toBeEmpty();
  });
});
