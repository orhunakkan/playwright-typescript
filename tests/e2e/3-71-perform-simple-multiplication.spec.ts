// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Perform Simple Multiplication (6 × 7 = 42)', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Click button "6"
    await page.getByText('6').click();

    // 4. Click button "×" (multiplication)
    await page.getByText('x').click();

    // 5. Click button "7"
    await page.getByText('7').click();

    // 6. Click button "="
    await page.getByText('=').click();

    // 7. Wait for result to appear (5 seconds delay)
    await page.getByText("42").first().waitFor({ state: 'visible' });

    // 8. Verify display shows "42"
    await expect(page.getByText('42')).toBeVisible();
  });
});
