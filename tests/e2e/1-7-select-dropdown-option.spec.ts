// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Select Dropdown (Select) Option', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Dropdown (select)" combobox
    const dropdown = page.getByRole('combobox', { name: 'Dropdown (select)' });

    // 3. Verify default option is selected ("Open this select menu")
    await expect(dropdown).toHaveValue('Open this select menu');

    // 4. Select option "Two"
    await dropdown.selectOption('Two');

    // 5. Verify selected option "Two" has value "2"
    await expect(dropdown).toHaveValue('2');
  });
});
