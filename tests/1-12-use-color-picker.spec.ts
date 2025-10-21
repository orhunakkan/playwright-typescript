// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Use Color Picker', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Verify default color value is #563d7c
    const colorPicker = page.getByRole('textbox', { name: 'Color picker' });
    await expect(colorPicker).toHaveValue('#563d7c');

    // 3. Set color to #ff0000 and verify
    await colorPicker.fill('#ff0000');
    await expect(colorPicker).toHaveValue('#ff0000');
  });
});
