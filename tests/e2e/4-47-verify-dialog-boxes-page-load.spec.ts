// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dialog Boxes - JavaScript Dialogs', () => {
  test('Verify Dialog Boxes Page Load', async ({ page }) => {
    // 1. Navigate to dialog-boxes.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html');

    // 2. Wait for page to load completely
    await expect(page).toHaveURL(/dialog-boxes\.html/);
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    await expect(page.getByRole('heading', { name: 'Dialog boxes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Launch alert' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Launch confirm' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Launch prompt' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Launch modal' })).toBeVisible();
  });
});
