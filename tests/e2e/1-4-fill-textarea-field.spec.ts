// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Form Testing', () => {
  test('Fill Textarea Field', async ({ page }) => {
    // 1. Navigate to the Web form page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Textarea" field
    const textarea = page.getByRole('textbox', { name: 'Textarea' });

    // 3. Click in the textarea field
    // 4. Type long text
    await textarea.fill('This is a longer text input that spans multiple lines and tests textarea functionality');

    // Verify textarea accepts multi-line input
    // Verify entered text is fully visible
    await expect(textarea).toHaveValue('This is a longer text input that spans multiple lines and tests textarea functionality');
  });
});
