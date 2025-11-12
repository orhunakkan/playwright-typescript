// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Return to Index from IFrames Page', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // Verify we're on iframes page
    await expect(page).toHaveURL(/iframes\.html/);
    await expect(page.getByRole('heading', { name: 'IFrame', exact: true })).toBeVisible();

    // 2. If in iframe context, switch to default content (not needed in Playwright - page context is always main)
    // 3. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Verify successfully returned to index page
    await expect(page).toHaveURL(/index\.html/);
    await expect(page.getByRole('heading', { name: 'Practice site' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'IFrames' })).toBeVisible();

    // Verify no iframe content persists
    const iframe = page.locator('iframe');
    await expect(iframe).not.toBeVisible();
  });
});
