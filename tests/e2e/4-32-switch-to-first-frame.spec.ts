// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Switch to First Frame', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // 2. Switch context to the first frame (index 0 / name 'frame-header')
    const firstFrame = page.frame({ name: 'frame-header' });
    expect(firstFrame).not.toBeNull();

    // 3. Verify content within first frame
    const heading = firstFrame!.locator('h1.display-4');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Hands-On Selenium WebDriver with Java');

    // 4. Locate elements within the frame
    const practiceHeading = firstFrame!.locator('h5');
    await expect(practiceHeading).toBeVisible();
    await expect(practiceHeading).toHaveText('Practice site');

    // Verify GitHub link is present in frame
    const githubLink = firstFrame!.locator('a[href*="github.com"]');
    await expect(githubLink).toBeVisible();

    // Verify frame URL
    expect(firstFrame!.url()).toContain('header.html');
  });
});
