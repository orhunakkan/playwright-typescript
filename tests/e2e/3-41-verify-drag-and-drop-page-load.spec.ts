// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Testing', () => {
  test('Verify Drag and Drop Page Load', async ({ page }) => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Click on "Drag and drop" link in Chapter 3 section
    await page.getByRole('link', { name: 'Drag and drop' }).click();

    // Expected Results: "Drag and drop" heading is visible
    await expect(page.getByRole('heading', { name: 'Drag and drop' })).toBeVisible();

    // Expected Results: "Draggable panel" heading is visible
    await expect(page.getByRole('heading', { name: 'Draggable panel' })).toBeVisible();

    // Expected Results: Panel with text "Drag me" is displayed
    await expect(page.getByText('Drag me')).toBeVisible();
  });
});
