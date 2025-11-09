// spec: tests/e2e/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Testing', () => {
  test('Attempt to Drag Outside Page Boundaries', async ({ page }) => {
    // 1. Navigate to drag-and-drop.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/drag-and-drop.html');

    // 2-3. Drag "Drag me" panel beyond the page boundaries and observe behavior
    await page.getByText('Drag me').dragTo(page.getByRole('heading', { name: 'Practice site' }));

    // Expected Results: Panel behavior after attempting to drag outside boundaries
    await expect(page.getByText('Drag me')).toBeVisible();
  });
});
