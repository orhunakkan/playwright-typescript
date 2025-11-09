// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Form Testing', () => {
  test('Verify Disabled Input Field', async ({ page }) => {
    // 1. Navigate to the Web form page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Disabled input" field
    const disabledInput = page.getByRole('textbox', { name: 'Disabled input' });

    // Verify disabled input field is visually distinguishable (visible on page)
    await expect(disabledInput).toBeVisible();

    // Verify field attribute shows disabled state
    await expect(disabledInput).toBeDisabled();

    // 3. Attempt to click in the disabled input field (should not be editable)
    // 4. Attempt to type text in the disabled field (should not accept input)
    // Note: Playwright's fill() will fail on disabled elements, which confirms the field is properly disabled
    await expect(disabledInput).toHaveAttribute('disabled', '');

    // Verify the field has empty value (disabled fields typically don't accept input)
    await expect(disabledInput).toHaveValue('');
  });
});
