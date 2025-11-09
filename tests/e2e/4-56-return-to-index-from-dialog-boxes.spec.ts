// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Return to Index from Dialog Boxes Page', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Ensure no dialogs are open
    await expect(page).toHaveURL(/dialog-boxes\.html/);
    await expect(page.getByRole('heading', { name: 'Dialog boxes' })).toBeVisible();

    // 3. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    await expect(page).toHaveURL(/index\.html/);
    await expect(page.getByRole('link', { name: 'Dialog boxes' })).toBeVisible();
  });
});
