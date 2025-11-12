// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Verify Frame Independence', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // 2. Switch to first frame
    const firstFrame = page.frame({ name: 'frame-header' });
    expect(firstFrame).not.toBeNull();

    // Verify elements in first frame are accessible
    const heading = firstFrame!.locator('h1.display-4');
    await expect(heading).toBeVisible();

    // 3. Attempt to access elements from second frame while in first frame context
    // Elements from second frame (Lorem ipsum paragraphs) should NOT be accessible in first frame
    const paragraphsInFirstFrame = firstFrame!.locator('p:has-text("Lorem ipsum")');
    await expect(paragraphsInFirstFrame).toBeHidden();

    // 4. Verify elements are not accessible - must explicitly switch context
    const secondFrame = page.frame({ name: 'frame-body' });
    expect(secondFrame).not.toBeNull();

    // Now in second frame context, Lorem ipsum paragraphs are accessible
    const paragraphsInSecondFrame = secondFrame!.locator('p');
    await expect(paragraphsInSecondFrame.first()).toBeVisible();
    await expect(paragraphsInSecondFrame.first()).toContainText('Lorem ipsum');

    // But header h1 from first frame is NOT accessible in second frame
    const headingInSecondFrame = secondFrame!.locator('h1:has-text("Hands-On Selenium WebDriver")');
    await expect(headingInSecondFrame).toBeHidden();

    // Each frame maintains proper isolation
    expect(firstFrame!.url()).toContain('header.html');
    expect(secondFrame!.url()).toContain('content.html');
  });
});
