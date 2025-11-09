// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Launch and Accept Alert Dialog', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Set up alert handler to accept and verify alert message
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('Hello world!');
      // 5. Accept the alert
      await dialog.accept();
    });

    // 3. Click "Launch alert" button
    await page.getByRole('button', { name: 'Launch alert' }).click();

    // 6. Verify alert is dismissed - page remains functional
    await expect(page.getByRole('button', { name: 'Launch alert' })).toBeVisible();
  });
});
