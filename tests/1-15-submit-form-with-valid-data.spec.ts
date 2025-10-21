// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Submit Form with Valid Data', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Fill inputs
    await page.getByRole('textbox', { name: 'Text input' }).fill('John Doe');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test123!');
    await page.getByRole('textbox', { name: 'Textarea' }).fill('This is a test message');

    // 3. Select "Two" from Dropdown (select)
    await page.getByRole('combobox', { name: 'Dropdown (select)' }).selectOption('2');

    // 4. Check Default checkbox and select Default radio
    await page.getByRole('checkbox', { name: 'Default checkbox' }).click();
    await page.getByRole('radio', { name: 'Default radio' }).click();

    // 5. Submit the form
    await page.getByRole('button', { name: 'Submit' }).click();

    // 6. Verify submission
    await expect(page.getByText('Form submitted')).toBeVisible();
    await expect(page.getByText('Received!')).toBeVisible();

    // Optional: verify URL contains submitted data
    // Use a RegExp literal so Playwright matches the full URL that includes the domain and query string
    await expect(page).toHaveURL(/submitted-form.html\?/);
  });
});
