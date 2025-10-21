// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Form Testing', () => {
  test('Fill Password Field', async ({ page }) => {
    // 1. Navigate to the Web form page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Password" field
    const passwordField = page.getByRole('textbox', { name: 'Password' });

    // 3. Click in the password field
    // 4. Type "SecureP@ssw0rd"
    await passwordField.fill('SecureP@ssw0rd');

    // Verify password field accepts keyboard input
    // Verify entered text is stored (the field is type=password, so it's masked visually)
    await expect(passwordField).toHaveValue('SecureP@ssw0rd');

    // Verify password field has type="password" attribute (ensures masking)
    await expect(passwordField).toHaveAttribute('type', 'password');
  });
});
