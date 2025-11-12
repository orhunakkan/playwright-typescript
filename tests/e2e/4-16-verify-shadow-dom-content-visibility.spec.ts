// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Verify Shadow DOM Content Visibility', async ({ page }) => {
    // 1. Navigate to shadow DOM page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // 2. Locate the "Hello Shadow DOM" text
    const shadowDomText = page.getByText('Hello Shadow DOM');

    // 3. Verify text is visible in the viewport
    await expect(shadowDomText).toBeVisible();

    // Verify text appears below the main heading
    await expect(page.getByRole('heading', { name: 'Shadow DOM' })).toBeVisible();
  });
});
