// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu Testing', () => {
  test('Verify Dropdown Menu Page Load', async ({ page }) => {
    // 1. Navigate to index page and click on "Dropdown menu" link
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Dropdown menu" link in Chapter 3 section
    await page.getByRole('link', { name: 'Dropdown menu' }).click();

    // Verify page navigates to dropdown-menu.html and all elements are visible
    await expect(page).toHaveURL(/dropdown-menu\.html/);
    await expect(page.getByRole('heading', { name: 'Dropdown menu' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use left-click here' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use right-click here' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use double-click here' })).toBeVisible();
  });
});
