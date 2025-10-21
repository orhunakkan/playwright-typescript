// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Submit Form with Empty Fields', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Submit with default/empty values
    await page.getByRole('button', { name: 'Submit' }).click();

    // 3. Verify submission succeeded
    await expect(page.getByText('Form submitted')).toBeVisible();
    await expect(page.getByText('Received!')).toBeVisible();
  });
});
