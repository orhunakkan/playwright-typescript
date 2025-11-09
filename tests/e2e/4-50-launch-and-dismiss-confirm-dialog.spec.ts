// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Launch and Dismiss Confirm Dialog', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Set up confirm dialog handler to dismiss (click Cancel)
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toBe('Is this correct?');
      // 5. Dismiss the confirm dialog
      await dialog.dismiss();
    });

    // 3. Click "Launch confirm" button
    await page.getByRole('button', { name: 'Launch confirm' }).click();

    // 6. Check result paragraph for "Cancel" message
    await expect(page.getByText('You chose: false')).toBeVisible();
  });
});
