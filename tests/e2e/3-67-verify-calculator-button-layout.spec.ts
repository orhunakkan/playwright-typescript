// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Verify Calculator Button Layout', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Verify number button 0 is visible
    await expect(page.getByText('0', { exact: true })).toBeVisible();

    // Verify number button 9 is visible
    await expect(page.getByText('9', { exact: true })).toBeVisible();

    // Verify + operator button is visible
    await expect(page.getByText('+', { exact: true })).toBeVisible();

    // Verify = button is visible
    await expect(page.getByText('=', { exact: true })).toBeVisible();

    // Verify C (clear) button is visible
    await expect(page.getByText('C', { exact: true })).toBeVisible();
  });
});
