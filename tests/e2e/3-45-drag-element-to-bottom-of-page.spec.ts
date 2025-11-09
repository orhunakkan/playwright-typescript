// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Testing', () => {
  test('Drag Element to Bottom of Page', async ({ page }) => {
    // 1. Navigate to drag-and-drop.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/drag-and-drop.html');

    // 2-3. Drag "Drag me" panel toward the bottom of the visible page area and release
    await page.getByText('Drag me').dragTo(page.getByRole('link', { name: 'Boni García' }));

    // Expected Results: Panel remains visible after drag to bottom
    await expect(page.getByText('Drag me')).toBeVisible();
  });
});
