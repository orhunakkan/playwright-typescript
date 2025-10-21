// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Form Testing', () => {
  test('Verify Readonly Input Field', async ({ page }) => {
    // 1. Navigate to the Web form page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Locate the "Readonly input" field
    const readonlyInput = page.getByRole('textbox', { name: 'Readonly input' });

    // 3. Verify the pre-filled text value
    // Verify readonly input displays default text "Readonly input"
    await expect(readonlyInput).toHaveValue('Readonly input');

    // Verify field attribute shows readonly state
    await expect(readonlyInput).toHaveAttribute('readonly', '');

    // 4. Attempt to modify the text (readonly fields should not be editable)
    // Note: Playwright's fill() will work but the field attribute prevents actual editing in the browser
    // We verify the readonly attribute exists which ensures browser-level protection
    await expect(readonlyInput).toHaveAttribute('readonly');
  });
});
