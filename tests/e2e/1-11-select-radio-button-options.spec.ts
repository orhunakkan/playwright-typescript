// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Select Radio Button Options', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Verify 'Checked radio' is selected by default
    const checkedRadio = page.getByRole('radio', { name: 'Checked radio' });
    await expect(checkedRadio).toBeChecked();

    // 3. Click the 'Default radio' button and verify selection
    const defaultRadio = page.getByRole('radio', { name: 'Default radio' });
    await defaultRadio.click();
    await expect(defaultRadio).toBeChecked();

    // 4. Ensure only one radio is selected (mutual exclusivity)
    await expect(checkedRadio).not.toBeChecked();
  });
});
