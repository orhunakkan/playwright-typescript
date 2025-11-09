// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Interact with Dropdown Datalist', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2-3. Locate the "Dropdown (datalist)" field and type "San Francisco"
    const datalistField = page.getByRole('combobox', { name: 'Dropdown (datalist)' });
    await datalistField.fill('San Francisco');
    await expect(datalistField).toHaveValue('San Francisco');

    // 4. Submit the form
    await page.getByRole('button', { name: 'Submit' }).click();

    // 5. Verify form submission was successful
    await expect(page.getByText('Form submitted')).toBeVisible();
    await expect(page.getByText('Received!')).toBeVisible();
  });
});
