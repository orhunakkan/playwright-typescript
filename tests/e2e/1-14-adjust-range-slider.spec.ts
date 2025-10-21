// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Adjust Range Slider', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    const slider = page.getByRole('slider', { name: 'Example range' });

    // 2. Verify default value is 5
    await expect(slider).toHaveValue('5');

    // 3. Set to minimum (0)
    await slider.evaluate((el: HTMLInputElement) => (el.value = '0'));
    await expect(slider).toHaveValue('0');

    // 4. Set to maximum (10)
    await slider.evaluate((el: HTMLInputElement) => (el.value = '10'));
    await expect(slider).toHaveValue('10');

    // 5. Set back to middle (5)
    await slider.evaluate((el: HTMLInputElement) => (el.value = '5'));
    await expect(slider).toHaveValue('5');
  });
});
