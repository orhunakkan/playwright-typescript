// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Verify Parent and IFrame Isolation', async ({ page }) => {
    // 1. Navigate to iframes page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Attempt to access iframe content without switching context
    const loremTextInMain = page.getByText('Lorem ipsum dolor sit amet', { exact: false });
    await expect(loremTextInMain).toBeHidden();

    // 3. Verify content is not accessible from main page
    const mainParagraphs = page.locator('main > p');
    await expect(mainParagraphs).toHaveCount(0);

    // 4. Switch to iframe and verify access succeeds
    const iframe = page.frameLocator('iframe');
    const iframeParagraph = iframe.locator('p').first();
    await expect(iframeParagraph).toBeVisible();
    await expect(iframeParagraph).toContainText('Lorem ipsum');
  });
});
