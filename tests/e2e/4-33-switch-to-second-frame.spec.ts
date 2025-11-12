// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Switch to Second Frame', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // 2. Switch context to the second frame (index 1 / name 'frame-body')
    const secondFrame = page.frame({ name: 'frame-body' });
    expect(secondFrame).not.toBeNull();

    // 3. Verify content within second frame
    const paragraphs = secondFrame!.locator('p');
    await expect(paragraphs.first()).toBeVisible();
    await expect(paragraphs.first()).toContainText('Lorem ipsum');

    // Verify frame has multiple paragraphs (approximately 20)
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBe(20);

    // Verify frame URL is different from first frame
    expect(secondFrame!.url()).toContain('content.html');

    // 4. Verify it's different from first frame
    // Second frame contains Lorem ipsum content, not header content
    const heading = secondFrame!.locator('h1');
    await expect(heading).toBeHidden();
  });
});
