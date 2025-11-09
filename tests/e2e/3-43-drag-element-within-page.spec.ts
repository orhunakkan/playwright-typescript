// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Testing', () => {
  test('Drag Element Within Page', async ({ page }) => {
    // 1. Navigate to drag-and-drop.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/drag-and-drop.html');

    // 2-4. Click and hold the "Drag me" panel, move to different position, and release
    await page.getByText('Drag me').dragTo(page.getByRole('heading', { name: 'Drag and drop' }));

    // Expected Results: Panel remains visible after drag
    await expect(page.getByText('Drag me')).toBeVisible();
  });
});
