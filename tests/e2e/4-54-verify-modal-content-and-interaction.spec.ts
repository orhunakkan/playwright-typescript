// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Verify Modal Content and Interaction', async ({ page }) => {
    // 1. Navigate to dialog boxes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Click "Launch modal" button
    await page.getByRole('button', { name: 'Launch modal' }).click();

    // 3. Verify modal content
    await expect(page.getByRole('heading', { name: 'Modal title' })).toBeVisible();
    await expect(page.getByText('This is the modal body')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible();

    // 5. Close modal and verify page is accessible
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('button', { name: 'Launch alert' })).toBeVisible();
    await expect(page.getByText('You chose: Save changes')).toBeVisible();
  });
});
