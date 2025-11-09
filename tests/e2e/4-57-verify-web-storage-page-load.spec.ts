// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Storage - Local and Session Storage', () => {
  test('Verify Web Storage Page Load', async ({ page }) => {
    // 1. Navigate to web-storage.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-storage.html');

    // 2. Wait for page to load completely
    await expect(page).toHaveURL(/web-storage\.html/);
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    await expect(page.getByRole('heading', { name: 'Web storage' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Display local storage' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Display session storage' })).toBeVisible();
  });
});
