// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Switch Between Frames Multiple Times', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // 2. Switch to first frame and verify content
    const firstFrame = page.frame({ name: 'frame-header' });
    expect(firstFrame).not.toBeNull();

    const heading1 = firstFrame!.locator('h1.display-4');
    await expect(heading1).toBeVisible();
    await expect(heading1).toHaveText('Hands-On Selenium WebDriver with Java');

    // 3. Switch to second frame and verify content
    const secondFrame = page.frame({ name: 'frame-body' });
    expect(secondFrame).not.toBeNull();

    const paragraphs = secondFrame!.locator('p');
    await expect(paragraphs.first()).toBeVisible();
    await expect(paragraphs.first()).toContainText('Lorem ipsum');
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBe(20);

    // 4. Switch back to first frame and verify content is still accessible
    const heading1Again = firstFrame!.locator('h1.display-4');
    await expect(heading1Again).toBeVisible();
    await expect(heading1Again).toHaveText('Hands-On Selenium WebDriver with Java');

    const practiceHeading = firstFrame!.locator('h5');
    await expect(practiceHeading).toBeVisible();
    await expect(practiceHeading).toHaveText('Practice site');

    // 5. Verify we can access default content (main page)
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/frames.html');
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // Verify frameset still exists in main page
    const frameCount = await page.evaluate(() => window.frames.length);
    expect(frameCount).toBe(3);
  });
});
