// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Launch and Accept Prompt Dialog with Input', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Set up prompt dialog handler to accept with text input
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      expect(dialog.message()).toBe('Please enter your name');
      // 5. Enter text and accept
      await dialog.accept('Test User');
    });

    // 3. Click "Launch prompt" button
    await page.getByRole('button', { name: 'Launch prompt' }).click();

    // 6. Check result paragraph for entered text
    await expect(page.getByText('You typed: Test User')).toBeVisible();
  });
});
