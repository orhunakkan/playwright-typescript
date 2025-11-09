// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Verify Slow Calculator Page Load', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link in Chapter 3 section
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Verify "Slow Calculator" heading is visible
    await expect(page.getByRole('heading', { name: 'Slow calculator' })).toBeVisible();

    // Verify delay input field shows default value of 5
    await expect(page.locator('#delay')).toHaveValue('5');
  });
});
