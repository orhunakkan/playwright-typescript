// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Switch Back to Main Page from IFrame', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Switch to iframe context
    const iframe = page.frameLocator('iframe');
    
    // 3. Perform actions within iframe
    const iframeParagraph = iframe.locator('p').first();
    await expect(iframeParagraph).toBeVisible();
    
    // 4. Switch back to default/parent content (automatic in Playwright - page locators work on main page)
    // 5. Verify main page elements are accessible
    await expect(page.getByRole('heading', { name: 'IFrame', exact: true })).toBeVisible();
    await expect(page.getByText('Copyright © 2021-2025')).toBeVisible();
  });
});
