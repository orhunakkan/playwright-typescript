// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Launch Modal Dialog', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Click "Launch modal" button
    await page.getByRole('button', { name: 'Launch modal' }).click();

    // 3. Verify modal appears on page
    await expect(page.getByRole('heading', { name: 'Modal title' })).toBeVisible();
    await expect(page.getByText('This is the modal body')).toBeVisible();

    // 5. Close the modal
    await page.getByRole('button', { name: 'Close' }).click();

    // 6. Verify modal is dismissed - main page is accessible
    await expect(page.getByRole('heading', { name: 'Dialog boxes' })).toBeVisible();
    await expect(page.getByText('You chose: Close')).toBeVisible();
  });
});
