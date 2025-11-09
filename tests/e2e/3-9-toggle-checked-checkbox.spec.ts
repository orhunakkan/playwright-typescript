// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Toggle Checked Checkbox', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Checked checkbox" and verify it is initially checked
    const checkedCheckbox = page.getByRole('checkbox', { name: 'Checked checkbox' });
    await expect(checkedCheckbox).toBeChecked();

    // 3. Click the checkbox to uncheck it
    await checkedCheckbox.click();
    await expect(checkedCheckbox).not.toBeChecked();

    // 4. Click the checkbox again to re-check it
    await checkedCheckbox.click();
    await expect(checkedCheckbox).toBeChecked();
  });
});
