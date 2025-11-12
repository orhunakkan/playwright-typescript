// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Testing', () => {
  test('Rapid Drag and Release', async ({ page }) => {
    // 1. Navigate to drag-and-drop.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/drag-and-drop.html');

    // 2-3. Quickly drag panel to a new position and immediately release - First drag
    await page.getByText('Drag me').dragTo(page.getByRole('heading', { name: 'Drag and drop' }));

    // 2-3. Quickly drag panel to a new position and immediately release - Second drag
    await page.getByText('Drag me').dragTo(page.getByRole('heading', { name: 'Draggable panel' }));

    // Expected Results: Panel completes all rapid drag operations successfully
    await expect(page.getByText('Drag me')).toBeVisible();
  });
});
