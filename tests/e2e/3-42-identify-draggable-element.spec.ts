// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Testing', () => {
  test('Identify Draggable Element', async ({ page }) => {
    // 1. Navigate to drag-and-drop.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/drag-and-drop.html');

    // 2. Locate the panel with "Drag me" text
    await expect(page.getByText('Drag me')).toBeVisible();

    // 3. Verify element properties - hover over draggable element
    await page.getByText('Drag me').hover();
  });
});
