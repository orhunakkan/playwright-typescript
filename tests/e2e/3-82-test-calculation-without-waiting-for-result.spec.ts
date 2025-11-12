// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Calculation Without Waiting for Result', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 2. Click button "2"
    await page.getByText('2', { exact: true }).click();

    // 3. Click button "+"
    await page.getByText('+').click();

    // 4. Click button "2" again
    await page.getByText('2', { exact: true }).click();

    // 5. Click button "="
    await page.getByText('=').click();

    // 6. Click "C" before result appears
    await page.getByText('C', { exact: true }).click();

    // 7. Verify clear button still visible (display cleared)
    await expect(page.getByText('C', { exact: true })).toBeVisible();
  });
});
