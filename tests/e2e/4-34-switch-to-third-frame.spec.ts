// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Switch to Third Frame', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // 2. Switch context to the third frame (index 2 / name 'frame-footer')
    const thirdFrame = page.frame({ name: 'frame-footer' });
    expect(thirdFrame).not.toBeNull();
    
    // 3. Verify content within third frame
    const footerContent = thirdFrame!.locator('body');
    await expect(footerContent).toBeVisible();
    await expect(footerContent).toContainText('Copyright © 2021-2025');
    await expect(footerContent).toContainText('Boni García');
    
    // Verify copyright link is present
    const authorLink = thirdFrame!.locator('a[href*="bonigarcia.dev"]');
    await expect(authorLink).toBeVisible();
    
    // Verify frame URL is distinct from other frames
    expect(thirdFrame!.url()).toContain('footer.html');
    
    // Content is distinct from other frames (contains copyright, not header or Lorem ipsum)
    await expect(footerContent).not.toContainText('Practice site');
    await expect(footerContent).not.toContainText('Lorem ipsum');
  });
});
