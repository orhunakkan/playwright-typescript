// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Use Date Picker', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the Date picker and set a date
    const datePicker = page.getByRole('textbox', { name: 'Date picker' });
    await datePicker.fill('2021-10-20');
    await expect(datePicker).toHaveValue('2021-10-20');
  });
});
