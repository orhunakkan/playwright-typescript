// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Slow Calculator Testing', () => {
  test('Perform Simple Division (8 ÷ 2 = 4)', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Slow calculator" link
    await page.getByRole('link', { name: 'Slow calculator' }).click();

    // 3. Click button "8"
    await page.getByText('8').click();

    // 4. Click button "÷" (division)
    await page.getByText('÷').click();

    // 5. Click button "2"
    await page.getByText('2', { exact: true }).click();

    // 6. Click button "="
    await page.getByText('=').click();

    // 7. Wait for result to appear (5 seconds delay)
    await page.getByText("4").first().waitFor({ state: 'visible' });

    // 8. Verify display shows "4"
    await expect(page.getByText('4')).toBeVisible();
  });
});
