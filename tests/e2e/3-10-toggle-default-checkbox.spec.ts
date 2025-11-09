// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Toggle Default Checkbox', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Default checkbox" and verify it is initially unchecked
    const defaultCheckbox = page.getByRole('checkbox', { name: 'Default checkbox' });
    await expect(defaultCheckbox).not.toBeChecked();

    // 3. Click the checkbox to check it
    await defaultCheckbox.click();
    await expect(defaultCheckbox).toBeChecked();

    // 4. Click the checkbox again to uncheck it
    await defaultCheckbox.click();
    await expect(defaultCheckbox).not.toBeChecked();
  });
});
