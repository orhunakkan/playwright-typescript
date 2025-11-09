// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Handle Multiple Dialog Types in Sequence', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Launch and handle alert
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Launch alert' }).click();

    // 3. Launch and handle confirm (accept)
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Launch confirm' }).click();
    await expect(page.getByText('You chose: true')).toBeVisible();

    // 4. Launch and handle prompt (with input)
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Sequence Test');
    });
    await page.getByRole('button', { name: 'Launch prompt' }).click();
    await expect(page.getByText('You typed: Sequence Test')).toBeVisible();

    // 5. Launch and close modal
    await page.getByRole('button', { name: 'Launch modal' }).click();
    await page.getByRole('button', { name: 'Close' }).click();

    // 6. Verify all work correctly
    await expect(page.getByText('You chose: Close')).toBeVisible();
  });
});
