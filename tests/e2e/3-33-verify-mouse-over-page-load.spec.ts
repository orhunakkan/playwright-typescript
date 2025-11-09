// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Mouse Over Testing', () => {
  test('Verify Mouse Over Page Load', async ({ page }) => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Mouse over" link in Chapter 3 section
    await page.getByRole('link', { name: 'Mouse over' }).click();

    // Verify "Mouse over" heading is visible
    await expect(page.getByRole('heading', { name: 'Mouse over' })).toBeVisible();

    // Verify initial caption "Compass" is visible
    await expect(page.getByText('Compass')).toBeVisible();
  });
});
