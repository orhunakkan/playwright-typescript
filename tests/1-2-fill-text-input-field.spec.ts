// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Form Testing', () => {
  test('Fill Text Input Field', async ({ page }) => {
    // 1. Navigate to the Web form page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Text input" field
    const textInput = page.getByRole('textbox', { name: 'Text input' });

    // 3. Click in the text input field
    // 4. Type "Sample text input"
    await textInput.fill('Sample text input');

    // Verify text input field accepts keyboard input
    // Verify entered text "Sample text input" is visible in the field
    await expect(textInput).toHaveValue('Sample text input');
  });
});
